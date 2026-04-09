"""
FastAPI web server — the HTTP layer that ties the pipeline together.

Provides:
  - Webhook endpoints (Stripe, SendGrid, WhatsApp, Telegram)
  - Preview/demo hosting (serve blurred and full mockups)
  - Public API (request a redesign from the website form)
  - Admin dashboard API (pipeline stats, lead management)
  - Client onboarding & dashboard (Supabase Auth + Stripe)
  - Static file serving for the agency website
"""

from __future__ import annotations

import json
import stripe as stripe_lib
from datetime import datetime, timedelta, timezone
from pathlib import Path

from fastapi import FastAPI, Request, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy import select, func, desc, asc

from config.settings import settings
from models.database import init_db, async_session
from models.lead import Lead, LeadStatus, WebsiteAudit
from models.deal import Deal, DealStage
from models.project import Project, ProjectStatus
from models.message import Message
from models.onboarding import OnboardingSubmission, SubmissionStatus
from services.auth_service import sign_up, sign_in, verify_session
from pipeline.webhooks import (
    handle_stripe_webhook,
    handle_inbound_email,
    handle_whatsapp_message,
    handle_telegram_message,
)

WEBSITE_DIR = Path(__file__).parent.parent / "website"
PREVIEW_DIR = Path("previews")
BUILDS_DIR = Path("builds")

stripe_lib.api_key = settings.stripe_secret_key

app = FastAPI(
    title="Velocity — AI Web Agency",
    description="Backend API for the autonomous AI web design agency",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════════════════
# Startup
# ═══════════════════════════════════════════════════════════

@app.on_event("startup")
async def startup():
    await init_db()


# ═══════════════════════════════════════════════════════════
# Public API — Website Form
# ═══════════════════════════════════════════════════════════

class RedesignRequest(BaseModel):
    website_url: str
    email: str


@app.post("/api/request-redesign")
async def request_redesign(req: RedesignRequest):
    """Handle redesign requests from the agency website CTA form."""
    async with async_session() as session:
        # Check if we already have this lead
        existing = await session.execute(
            select(Lead).where(Lead.email == req.email)
        )
        if existing.scalar_one_or_none():
            return {"status": "already_exists", "message": "We already have you on file!"}

        lead = Lead(
            business_name="Website Request",
            business_type="unknown",
            website_url=req.website_url,
            email=req.email,
            status=LeadStatus.DISCOVERED,
            notes="Inbound request from agency website",
        )
        session.add(lead)
        await session.commit()

    return {"status": "success", "message": "Your free redesign preview will be ready in 2 minutes to 48 hours depending on demand."}


# ═══════════════════════════════════════════════════════════
# Preview & Demo Hosting
# ═══════════════════════════════════════════════════════════

@app.get("/preview/{lead_id}")
async def serve_preview(lead_id: str):
    """Serve the blurred preview image for a lead."""
    blurred_path = PREVIEW_DIR / "blurred" / f"blurred_{lead_id}.png"
    if blurred_path.exists():
        return FileResponse(str(blurred_path), media_type="image/png")

    raise HTTPException(status_code=404, detail="Preview not found")


@app.get("/demo/{lead_id}")
async def serve_demo(lead_id: str):
    """Serve the full (unblurred) demo HTML mockup."""
    mockup_path = PREVIEW_DIR / "full" / f"mockup_{lead_id}.html"
    if mockup_path.exists():
        return HTMLResponse(mockup_path.read_text(encoding="utf-8"))

    raise HTTPException(status_code=404, detail="Demo not found")


@app.get("/demo/{lead_id}/image")
async def serve_demo_image(lead_id: str):
    """Serve the full demo screenshot."""
    full_path = PREVIEW_DIR / "full" / f"full_{lead_id}.png"
    if full_path.exists():
        return FileResponse(str(full_path), media_type="image/png")

    raise HTTPException(status_code=404, detail="Demo image not found")


# ═══════════════════════════════════════════════════════════
# Client Site Hosting (built sites)
# ═══════════════════════════════════════════════════════════

@app.get("/sites/{project_id}/{page}")
async def serve_built_site(project_id: str, page: str = "index.html"):
    """Serve pages from built client websites."""
    site_dir = BUILDS_DIR / f"site_{project_id}"
    page_path = site_dir / page

    if page_path.exists() and site_dir in page_path.resolve().parents:
        if page.endswith(".css"):
            return FileResponse(str(page_path), media_type="text/css")
        return HTMLResponse(page_path.read_text(encoding="utf-8"))

    raise HTTPException(status_code=404, detail="Page not found")


# ═══════════════════════════════════════════════════════════
# Webhooks
# ═══════════════════════════════════════════════════════════

@app.post("/webhooks/email/inbound")
async def email_inbound(request: Request):
    """SendGrid Inbound Parse webhook — receives email replies."""
    form = await request.form()

    sender_email = form.get("from", "")
    subject = form.get("subject", "")
    body = form.get("text", "") or form.get("html", "")

    # Extract email address from "Name <email>" format
    if "<" in sender_email and ">" in sender_email:
        sender_email = sender_email.split("<")[1].split(">")[0]

    result = await handle_inbound_email(sender_email, subject, body)
    return result


@app.post("/webhooks/whatsapp")
async def whatsapp_webhook(request: Request):
    """WhatsApp Business webhook."""
    data = await request.json()

    # WhatsApp webhook verification
    if request.method == "GET":
        mode = request.query_params.get("hub.mode")
        token = request.query_params.get("hub.verify_token")
        challenge = request.query_params.get("hub.challenge")

        if mode == "subscribe" and token == settings.whatsapp_verify_token:
            return int(challenge)
        raise HTTPException(status_code=403)

    # Process incoming messages
    for entry in data.get("entry", []):
        for change in entry.get("changes", []):
            messages = change.get("value", {}).get("messages", [])
            for msg in messages:
                phone = msg.get("from", "")
                text = msg.get("text", {}).get("body", "")
                if phone and text:
                    await handle_whatsapp_message(phone, text)

    return {"status": "ok"}


@app.get("/webhooks/whatsapp")
async def whatsapp_verify(
    mode: str = Query(None, alias="hub.mode"),
    token: str = Query(None, alias="hub.verify_token"),
    challenge: str = Query(None, alias="hub.challenge"),
):
    """WhatsApp webhook verification (GET request)."""
    if mode == "subscribe" and token == settings.whatsapp_verify_token:
        return int(challenge)
    raise HTTPException(status_code=403)


@app.post("/webhooks/telegram")
async def telegram_webhook(request: Request):
    """Telegram Bot webhook."""
    data = await request.json()

    message = data.get("message", {})
    chat_id = str(message.get("chat", {}).get("id", ""))
    text = message.get("text", "")

    if chat_id and text:
        result = await handle_telegram_message(chat_id, text)
        return result

    return {"status": "no_message"}


# ═══════════════════════════════════════════════════════════
# Admin Dashboard API
# ═══════════════════════════════════════════════════════════

@app.get("/api/admin/stats")
async def admin_stats():
    """Pipeline statistics for the admin dashboard."""
    async with async_session() as session:
        stats = {}

        # Lead counts by status
        for status in LeadStatus:
            result = await session.execute(
                select(func.count()).select_from(Lead).where(Lead.status == status)
            )
            count = result.scalar()
            if count > 0:
                stats[status.value] = count

        # Total leads
        total = await session.execute(
            select(func.count()).select_from(Lead)
        )
        stats["total_leads"] = total.scalar()

        # Active projects
        active = await session.execute(
            select(func.count()).select_from(Project).where(
                Project.status.in_([
                    ProjectStatus.QUEUED, ProjectStatus.DESIGNING,
                    ProjectStatus.BUILDING, ProjectStatus.REVIEW,
                ])
            )
        )
        stats["active_projects"] = active.scalar()

        # Delivered
        delivered = await session.execute(
            select(func.count()).select_from(Project).where(
                Project.status == ProjectStatus.LIVE
            )
        )
        stats["delivered"] = delivered.scalar()

        # Revenue (sum of paid deals)
        revenue = await session.execute(
            select(func.sum(Deal.price_cents)).where(
                Deal.stage == DealStage.PAID
            )
        )
        stats["revenue_cents"] = revenue.scalar() or 0

        return stats


@app.get("/api/admin/leads")
async def admin_leads(
    status: str | None = None,
    limit: int = 50,
    offset: int = 0,
):
    """List leads with optional status filter."""
    async with async_session() as session:
        query = select(Lead).order_by(Lead.created_at.desc()).limit(limit).offset(offset)

        if status:
            query = query.where(Lead.status == LeadStatus(status))

        result = await session.execute(query)
        leads = result.scalars().all()

        return [
            {
                "id": lead.id,
                "business_name": lead.business_name,
                "business_type": lead.business_type,
                "website_url": lead.website_url,
                "email": lead.email,
                "phone": lead.phone,
                "city": lead.city,
                "state": lead.state,
                "status": lead.status.value,
                "score": lead.score,
                "outreach_count": lead.outreach_count,
                "created_at": str(lead.created_at),
            }
            for lead in leads
        ]


@app.get("/api/admin/leads/{lead_id}")
async def admin_lead_detail(lead_id: str):
    """Get detailed lead info including audit and messages."""
    async with async_session() as session:
        result = await session.execute(select(Lead).where(Lead.id == lead_id))
        lead = result.scalar_one_or_none()
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")

        # Get audit
        audit_data = None
        if lead.audit:
            audit_data = {
                "performance_score": lead.audit.performance_score,
                "accessibility_score": lead.audit.accessibility_score,
                "seo_score": lead.audit.seo_score,
                "best_practices_score": lead.audit.best_practices_score,
                "is_mobile_friendly": lead.audit.is_mobile_friendly,
                "has_ssl": lead.audit.has_ssl,
                "load_time_ms": lead.audit.load_time_ms,
                "badness_score": lead.audit.badness_score,
            }

        # Get messages
        msg_result = await session.execute(
            select(Message).where(Message.lead_id == lead_id).order_by(Message.created_at.desc())
        )
        messages = [
            {
                "id": msg.id,
                "channel": msg.channel.value,
                "direction": msg.direction,
                "subject": msg.subject,
                "body": msg.body[:200],
                "created_at": str(msg.created_at),
            }
            for msg in msg_result.scalars().all()
        ]

        # Get deal
        deal_result = await session.execute(
            select(Deal).where(Deal.lead_id == lead_id).order_by(Deal.created_at.desc())
        )
        deal = deal_result.scalar_one_or_none()
        deal_data = None
        if deal:
            deal_data = {
                "stage": deal.stage.value,
                "package_name": deal.package_name,
                "price_cents": deal.price_cents,
                "preview_url": deal.preview_url,
                "demo_url": deal.demo_url,
            }

        return {
            "id": lead.id,
            "business_name": lead.business_name,
            "business_type": lead.business_type,
            "website_url": lead.website_url,
            "email": lead.email,
            "phone": lead.phone,
            "city": lead.city,
            "state": lead.state,
            "status": lead.status.value,
            "score": lead.score,
            "outreach_count": lead.outreach_count,
            "created_at": str(lead.created_at),
            "audit": audit_data,
            "deal": deal_data,
            "messages": messages,
        }


@app.get("/api/admin/projects")
async def admin_projects():
    """List all projects."""
    async with async_session() as session:
        result = await session.execute(
            select(Project).order_by(Project.created_at.desc())
        )
        projects = result.scalars().all()

        return [
            {
                "id": project.id,
                "lead_id": project.lead_id,
                "status": project.status.value,
                "site_type": project.site_type,
                "github_repo": project.github_repo,
                "live_url": project.live_url,
                "revision_count": project.revision_count,
                "created_at": str(project.created_at),
            }
            for project in projects
        ]


# ═══════════════════════════════════════════════════════════
# Health Check
# ═══════════════════════════════════════════════════════════

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "velocity-agency"}


# ═══════════════════════════════════════════════════════════
# Client Auth — Supabase Password-based
# ═══════════════════════════════════════════════════════════

class SignupRequest(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


async def get_current_user(request: Request) -> dict:
    """Extract and verify the bearer token from the request."""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = auth.split("Bearer ", 1)[1]
    user = await verify_session(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return user


@app.post("/api/client/signup")
async def client_signup(req: SignupRequest):
    """Create a new user via Supabase Auth."""
    try:
        result = await sign_up(req.email, req.password)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/client/login")
async def client_login(req: LoginRequest):
    """Authenticate and return session tokens."""
    try:
        result = await sign_in(req.email, req.password)
        return result
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@app.get("/api/client/me")
async def client_me(request: Request):
    """Return the current authenticated user."""
    user = await get_current_user(request)
    return user


@app.post("/api/client/logout")
async def client_logout():
    """Client-side logout — no server session to destroy."""
    return {"status": "ok"}


# ═══════════════════════════════════════════════════════════
# Client Onboarding
# ═══════════════════════════════════════════════════════════

class OnboardingPayload(BaseModel):
    full_name: str
    company_name: str = ""
    contact_email: str
    phone: str = ""
    niche: str = ""
    inspiration_links: str = ""
    inspiration_comments: str = ""
    anti_inspiration_links: str = ""
    anti_inspiration_comments: str = ""
    target_audience: str = ""
    color_primary: str = ""
    color_secondary: str = ""
    color_accent: str = ""
    color_sub: str = ""
    font_preferences: str = ""
    asset_logos: str = ""
    asset_trademarks: str = ""
    asset_photos: str = ""
    brand_upgrade_permission: bool = False
    domain_status: str = ""
    domain_url: str = ""
    timeline_date: str | None = None


@app.get("/api/client/onboarding")
async def get_client_onboarding(request: Request):
    """Get the current user's onboarding submission."""
    user = await get_current_user(request)
    async with async_session() as session:
        result = await session.execute(
            select(OnboardingSubmission).where(
                OnboardingSubmission.supabase_user_id == user["user_id"]
            ).order_by(OnboardingSubmission.created_at.desc())
        )
        submission = result.scalar_one_or_none()
        if not submission:
            raise HTTPException(status_code=404, detail="No submission found")

        return {
            "id": submission.id,
            "full_name": submission.full_name,
            "company_name": submission.company_name,
            "contact_email": submission.contact_email,
            "phone": submission.phone,
            "niche": submission.niche,
            "inspiration_links": submission.inspiration_links,
            "inspiration_comments": submission.inspiration_comments,
            "anti_inspiration_links": submission.anti_inspiration_links,
            "anti_inspiration_comments": submission.anti_inspiration_comments,
            "target_audience": submission.target_audience,
            "color_primary": submission.color_primary,
            "color_secondary": submission.color_secondary,
            "color_accent": submission.color_accent,
            "color_sub": submission.color_sub,
            "font_preferences": submission.font_preferences,
            "asset_logos": submission.asset_logos,
            "asset_trademarks": submission.asset_trademarks,
            "asset_photos": submission.asset_photos,
            "brand_upgrade_permission": submission.brand_upgrade_permission,
            "domain_status": submission.domain_status,
            "timeline_date": str(submission.timeline_date) if submission.timeline_date else None,
            "quote_amount": submission.quote_amount,
            "status": submission.status.value,
            "submission_timestamp": str(submission.submission_timestamp),
            "created_at": str(submission.created_at),
        }


@app.post("/api/client/onboarding/submit")
async def submit_onboarding(request: Request):
    """Submit or update the onboarding brief. 24-hour lock enforced server-side."""
    user = await get_current_user(request)
    body = await request.json()

    async with async_session() as session:
        # Check for existing submission + 24-hour rule
        existing = await session.execute(
            select(OnboardingSubmission).where(
                OnboardingSubmission.supabase_user_id == user["user_id"]
            )
        )
        sub = existing.scalar_one_or_none()

        if sub:
            # 24-hour lock
            if sub.submission_timestamp and (datetime.now(timezone.utc) - sub.submission_timestamp) >= timedelta(hours=24):
                raise HTTPException(status_code=403, detail="Submission is locked — 24 hours have passed. Contact support for changes.")
            # Update existing
            for key, val in body.items():
                if hasattr(sub, key) and key not in ("id", "supabase_user_id", "submission_timestamp", "quote_amount", "status"):
                    setattr(sub, key, val)
        else:
            # Create new
            timeline_dt = None
            if body.get("timeline_date"):
                try:
                    timeline_dt = datetime.fromisoformat(body["timeline_date"])
                except (ValueError, TypeError):
                    pass

            sub = OnboardingSubmission(
                supabase_user_id=user["user_id"],
                full_name=body.get("full_name", ""),
                company_name=body.get("company_name", ""),
                contact_email=body.get("contact_email", ""),
                phone=body.get("phone", ""),
                niche=body.get("niche", ""),
                inspiration_links=body.get("inspiration_links", ""),
                inspiration_comments=body.get("inspiration_comments", ""),
                anti_inspiration_links=body.get("anti_inspiration_links", ""),
                anti_inspiration_comments=body.get("anti_inspiration_comments", ""),
                target_audience=body.get("target_audience", ""),
                color_primary=body.get("color_primary", ""),
                color_secondary=body.get("color_secondary", ""),
                color_accent=body.get("color_accent", ""),
                color_sub=body.get("color_sub", ""),
                font_preferences=body.get("font_preferences", ""),
                asset_logos=body.get("asset_logos", ""),
                asset_trademarks=body.get("asset_trademarks", ""),
                asset_photos=body.get("asset_photos", ""),
                brand_upgrade_permission=body.get("brand_upgrade_permission", False),
                domain_status=body.get("domain_status", ""),
                timeline_date=timeline_dt,
                submission_timestamp=datetime.now(timezone.utc),
            )
            session.add(sub)

        await session.commit()
        return {"status": "success", "id": sub.id}


@app.post("/api/client/onboarding/draft")
async def save_onboarding_draft(request: Request):
    """Save a draft without finalizing the 24-hour clock."""
    user = await get_current_user(request)
    body = await request.json()

    async with async_session() as session:
        existing = await session.execute(
            select(OnboardingSubmission).where(
                OnboardingSubmission.supabase_user_id == user["user_id"]
            )
        )
        sub = existing.scalar_one_or_none()

        if sub:
            # Only update if still within 24 hours
            if sub.submission_timestamp and (datetime.now(timezone.utc) - sub.submission_timestamp) >= timedelta(hours=24):
                raise HTTPException(status_code=403, detail="Submission is locked.")
            for key, val in body.items():
                if hasattr(sub, key) and key not in ("id", "supabase_user_id", "quote_amount", "status"):
                    setattr(sub, key, val)
        else:
            timeline_dt = None
            if body.get("timeline_date"):
                try:
                    timeline_dt = datetime.fromisoformat(body["timeline_date"])
                except (ValueError, TypeError):
                    pass

            sub = OnboardingSubmission(
                supabase_user_id=user["user_id"],
                full_name=body.get("full_name", ""),
                company_name=body.get("company_name", ""),
                contact_email=body.get("contact_email", ""),
                phone=body.get("phone", ""),
                niche=body.get("niche", ""),
                inspiration_links=body.get("inspiration_links", ""),
                inspiration_comments=body.get("inspiration_comments", ""),
                anti_inspiration_links=body.get("anti_inspiration_links", ""),
                anti_inspiration_comments=body.get("anti_inspiration_comments", ""),
                target_audience=body.get("target_audience", ""),
                color_primary=body.get("color_primary", ""),
                color_secondary=body.get("color_secondary", ""),
                color_accent=body.get("color_accent", ""),
                color_sub=body.get("color_sub", ""),
                font_preferences=body.get("font_preferences", ""),
                asset_logos=body.get("asset_logos", ""),
                asset_trademarks=body.get("asset_trademarks", ""),
                asset_photos=body.get("asset_photos", ""),
                brand_upgrade_permission=body.get("brand_upgrade_permission", False),
                domain_status=body.get("domain_status", ""),
                timeline_date=timeline_dt,
            )
            session.add(sub)

        await session.commit()
        return {"status": "draft_saved"}


# ═══════════════════════════════════════════════════════════
# Client Stripe Checkout
# ═══════════════════════════════════════════════════════════

@app.post("/api/client/stripe/checkout")
async def create_stripe_checkout(request: Request):
    """Create a Stripe Checkout session for the user's quote."""
    user = await get_current_user(request)

    async with async_session() as session:
        result = await session.execute(
            select(OnboardingSubmission).where(
                OnboardingSubmission.supabase_user_id == user["user_id"]
            )
        )
        sub = result.scalar_one_or_none()
        if not sub:
            raise HTTPException(status_code=404, detail="No submission found")
        if not sub.quote_amount or sub.quote_amount <= 0:
            raise HTTPException(status_code=400, detail="No quote set yet")

        # Create Stripe Checkout Session
        try:
            session_stripe = stripe_lib.checkout.Session.create(
                mode="payment",
                success_url=f"{settings.agency_domain}/client/dashboard.html?payment=success",
                cancel_url=f"{settings.agency_domain}/client/dashboard.html",
                customer_email=sub.contact_email,
                line_items=[{
                    "price_data": {
                        "currency": "usd",
                        "unit_amount": int(sub.quote_amount * 100),
                        "product_data": {
                            "name": f"Web Design — {sub.company_name or sub.full_name}",
                            "description": "Custom website design and development by Velocity",
                        },
                    },
                    "quantity": 1,
                }],
                metadata={
                    "submission_id": sub.id,
                    "supabase_user_id": sub.supabase_user_id,
                },
            )
            return {"session_id": session_stripe.id}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════
# Admin — Onboarding Submissions
# ═══════════════════════════════════════════════════════════

def verify_admin(request: Request):
    """Check the admin secret header."""
    secret = request.headers.get("X-Admin-Secret", "")
    if not secret or not settings.admin_secret or secret != settings.admin_secret:
        raise HTTPException(status_code=403, detail="Forbidden")


@app.get("/api/admin/verify")
async def admin_verify(request: Request):
    """Verify admin secret — used by the frontend to check auth."""
    verify_admin(request)
    return {"status": "ok"}


@app.get("/api/admin/submissions")
async def admin_submissions(request: Request):
    """List all onboarding submissions."""
    verify_admin(request)
    async with async_session() as session:
        result = await session.execute(
            select(OnboardingSubmission).order_by(OnboardingSubmission.created_at.desc())
        )
        subs = result.scalars().all()
        return [
            {
                "id": s.id,
                "full_name": s.full_name,
                "company_name": s.company_name,
                "contact_email": s.contact_email,
                "phone": s.phone,
                "niche": s.niche,
                "inspiration_links": s.inspiration_links,
                "inspiration_comments": s.inspiration_comments,
                "anti_inspiration_links": s.anti_inspiration_links,
                "anti_inspiration_comments": s.anti_inspiration_comments,
                "target_audience": s.target_audience,
                "color_primary": s.color_primary,
                "color_secondary": s.color_secondary,
                "color_accent": s.color_accent,
                "color_sub": s.color_sub,
                "font_preferences": s.font_preferences,
                "asset_logos": s.asset_logos,
                "asset_trademarks": s.asset_trademarks,
                "asset_photos": s.asset_photos,
                "brand_upgrade_permission": s.brand_upgrade_permission,
                "domain_status": s.domain_status,
                "timeline_date": str(s.timeline_date) if s.timeline_date else None,
                "quote_amount": s.quote_amount,
                "status": s.status.value,
                "submission_timestamp": str(s.submission_timestamp),
                "created_at": str(s.created_at),
            }
            for s in subs
        ]


class QuoteUpdate(BaseModel):
    quote_amount: float | None = None


class StatusUpdate(BaseModel):
    status: str


@app.put("/api/admin/submissions/{submission_id}/quote")
async def admin_set_quote(submission_id: str, req: QuoteUpdate, request: Request):
    """Set the quote amount for a submission."""
    verify_admin(request)
    async with async_session() as session:
        result = await session.execute(
            select(OnboardingSubmission).where(OnboardingSubmission.id == submission_id)
        )
        sub = result.scalar_one_or_none()
        if not sub:
            raise HTTPException(status_code=404, detail="Submission not found")
        sub.quote_amount = req.quote_amount
        await session.commit()
        return {"status": "ok", "quote_amount": sub.quote_amount}


@app.put("/api/admin/submissions/{submission_id}/status")
async def admin_set_status(submission_id: str, req: StatusUpdate, request: Request):
    """Update the status of a submission."""
    verify_admin(request)
    async with async_session() as session:
        result = await session.execute(
            select(OnboardingSubmission).where(OnboardingSubmission.id == submission_id)
        )
        sub = result.scalar_one_or_none()
        if not sub:
            raise HTTPException(status_code=404, detail="Submission not found")
        try:
            sub.status = SubmissionStatus(req.status)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid status: {req.status}")
        await session.commit()
        return {"status": "ok", "new_status": sub.status.value}


# ═══════════════════════════════════════════════════════════
# Stripe Webhook — Client Payments
# ═══════════════════════════════════════════════════════════

@app.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    """Stripe payment webhook — handles both pipeline and client checkout payments."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        event = stripe_lib.Webhook.construct_event(
            payload, sig_header, settings.stripe_webhook_secret
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe_lib.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # ── Client Checkout: payment succeeded ──
    if event["type"] == "checkout.session.completed":
        session_data = event["data"]["object"]
        submission_id = session_data.get("metadata", {}).get("submission_id")

        if submission_id:
            # This is a client onboarding payment
            async with async_session() as db_session:
                result = await db_session.execute(
                    select(OnboardingSubmission).where(OnboardingSubmission.id == submission_id)
                )
                sub = result.scalar_one_or_none()
                if sub:
                    sub.status = SubmissionStatus.PAID
                    await db_session.commit()
            return {"status": "ok", "type": "client_payment"}

    # ── Fallback to existing pipeline webhook handler ──
    try:
        result = await handle_stripe_webhook(payload, sig_header)
        return result
    except Exception:
        return {"status": "ok", "event_type": event.get("type", "unknown")}


# ═══════════════════════════════════════════════════════════
# Static Files — Agency Website
# ═══════════════════════════════════════════════════════════

MEDIA_TYPES = {
    ".css": "text/css",
    ".js": "application/javascript",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".ico": "image/x-icon",
    ".html": "text/html",
    ".txt": "text/plain",
    ".xml": "application/xml",
}


def serve_file(filepath: Path):
    """Serve a file with the correct media type."""
    if filepath.exists() and filepath.is_file():
        ext = filepath.suffix
        return FileResponse(str(filepath), media_type=MEDIA_TYPES.get(ext, "application/octet-stream"))
    raise HTTPException(status_code=404)


if WEBSITE_DIR.exists():
    assets_dir = WEBSITE_DIR / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/")
    async def serve_website():
        return FileResponse(str(WEBSITE_DIR / "index.html"))

    # Client pages
    @app.get("/client/{filename:path}")
    async def serve_client_page(filename: str):
        filepath = WEBSITE_DIR / "client" / filename
        if filepath.exists() and filepath.is_file():
            content = filepath.read_text(encoding="utf-8")
            # Inject Stripe publishable key
            content = content.replace("__STRIPE_PUB_KEY__", settings.stripe_publishable_key)
            return HTMLResponse(content)
        raise HTTPException(status_code=404)

    # Admin pages
    @app.get("/admin/{filename:path}")
    async def serve_admin_page(filename: str):
        filepath = WEBSITE_DIR / "admin" / filename
        return serve_file(filepath)

    # Client styles
    @app.get("/client-styles.css")
    async def serve_client_styles():
        filepath = WEBSITE_DIR / "client-styles.css"
        return serve_file(filepath)

    # Serve CSS, JS, and other static files from website dir
    @app.get("/{filename:path}")
    async def serve_static(filename: str):
        filepath = WEBSITE_DIR / filename
        return serve_file(filepath)
