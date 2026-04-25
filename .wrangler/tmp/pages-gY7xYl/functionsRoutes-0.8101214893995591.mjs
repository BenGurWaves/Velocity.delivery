import { onRequestOptions as __api_admin_temp_token_js_onRequestOptions } from "/Users/bengur/velocity-delivery/functions/api/admin/temp-token.js"
import { onRequestPost as __api_admin_temp_token_js_onRequestPost } from "/Users/bengur/velocity-delivery/functions/api/admin/temp-token.js"
import { onRequestOptions as __api_leads_admin_update_js_onRequestOptions } from "/Users/bengur/velocity-delivery/functions/api/leads/admin-update.js"
import { onRequestPatch as __api_leads_admin_update_js_onRequestPatch } from "/Users/bengur/velocity-delivery/functions/api/leads/admin-update.js"
import { onRequestOptions as __api_leads_create_js_onRequestOptions } from "/Users/bengur/velocity-delivery/functions/api/leads/create.js"
import { onRequestPost as __api_leads_create_js_onRequestPost } from "/Users/bengur/velocity-delivery/functions/api/leads/create.js"
import { onRequestDelete as __api_leads_delete_js_onRequestDelete } from "/Users/bengur/velocity-delivery/functions/api/leads/delete.js"
import { onRequestOptions as __api_leads_delete_js_onRequestOptions } from "/Users/bengur/velocity-delivery/functions/api/leads/delete.js"
import { onRequestGet as __api_leads_list_js_onRequestGet } from "/Users/bengur/velocity-delivery/functions/api/leads/list.js"
import { onRequestOptions as __api_leads_list_js_onRequestOptions } from "/Users/bengur/velocity-delivery/functions/api/leads/list.js"
import { onRequestOptions as __api_leads_sync_sheet_js_onRequestOptions } from "/Users/bengur/velocity-delivery/functions/api/leads/sync-sheet.js"
import { onRequestPost as __api_leads_sync_sheet_js_onRequestPost } from "/Users/bengur/velocity-delivery/functions/api/leads/sync-sheet.js"
import { onRequestOptions as __api_stripe_checkout_js_onRequestOptions } from "/Users/bengur/velocity-delivery/functions/api/stripe/checkout.js"
import { onRequestPost as __api_stripe_checkout_js_onRequestPost } from "/Users/bengur/velocity-delivery/functions/api/stripe/checkout.js"
import { onRequestPost as __api_stripe_webhook_js_onRequestPost } from "/Users/bengur/velocity-delivery/functions/api/stripe/webhook.js"
import { onRequestGet as __admin_client__token__js_onRequestGet } from "/Users/bengur/velocity-delivery/functions/admin/client/[token].js"
import { onRequestGet as __api_leads__token__js_onRequestGet } from "/Users/bengur/velocity-delivery/functions/api/leads/[token].js"
import { onRequestOptions as __api_leads__token__js_onRequestOptions } from "/Users/bengur/velocity-delivery/functions/api/leads/[token].js"
import { onRequestPatch as __api_leads__token__js_onRequestPatch } from "/Users/bengur/velocity-delivery/functions/api/leads/[token].js"
import { onRequestGet as __api_messages__token__js_onRequestGet } from "/Users/bengur/velocity-delivery/functions/api/messages/[token].js"
import { onRequestOptions as __api_messages__token__js_onRequestOptions } from "/Users/bengur/velocity-delivery/functions/api/messages/[token].js"
import { onRequestPatch as __api_messages__token__js_onRequestPatch } from "/Users/bengur/velocity-delivery/functions/api/messages/[token].js"
import { onRequestPost as __api_messages__token__js_onRequestPost } from "/Users/bengur/velocity-delivery/functions/api/messages/[token].js"
import { onRequestGet as __dashboard__token__js_onRequestGet } from "/Users/bengur/velocity-delivery/functions/dashboard/[token].js"
import { onRequestGet as __onboard__token__js_onRequestGet } from "/Users/bengur/velocity-delivery/functions/onboard/[token].js"
import { onRequestGet as __preview__id__js_onRequestGet } from "/Users/bengur/velocity-delivery/functions/preview/[id].js"
import { onRequestOptions as __preview__id__js_onRequestOptions } from "/Users/bengur/velocity-delivery/functions/preview/[id].js"

export const routes = [
    {
      routePath: "/api/admin/temp-token",
      mountPath: "/api/admin",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_admin_temp_token_js_onRequestOptions],
    },
  {
      routePath: "/api/admin/temp-token",
      mountPath: "/api/admin",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_temp_token_js_onRequestPost],
    },
  {
      routePath: "/api/leads/admin-update",
      mountPath: "/api/leads",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_leads_admin_update_js_onRequestOptions],
    },
  {
      routePath: "/api/leads/admin-update",
      mountPath: "/api/leads",
      method: "PATCH",
      middlewares: [],
      modules: [__api_leads_admin_update_js_onRequestPatch],
    },
  {
      routePath: "/api/leads/create",
      mountPath: "/api/leads",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_leads_create_js_onRequestOptions],
    },
  {
      routePath: "/api/leads/create",
      mountPath: "/api/leads",
      method: "POST",
      middlewares: [],
      modules: [__api_leads_create_js_onRequestPost],
    },
  {
      routePath: "/api/leads/delete",
      mountPath: "/api/leads",
      method: "DELETE",
      middlewares: [],
      modules: [__api_leads_delete_js_onRequestDelete],
    },
  {
      routePath: "/api/leads/delete",
      mountPath: "/api/leads",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_leads_delete_js_onRequestOptions],
    },
  {
      routePath: "/api/leads/list",
      mountPath: "/api/leads",
      method: "GET",
      middlewares: [],
      modules: [__api_leads_list_js_onRequestGet],
    },
  {
      routePath: "/api/leads/list",
      mountPath: "/api/leads",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_leads_list_js_onRequestOptions],
    },
  {
      routePath: "/api/leads/sync-sheet",
      mountPath: "/api/leads",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_leads_sync_sheet_js_onRequestOptions],
    },
  {
      routePath: "/api/leads/sync-sheet",
      mountPath: "/api/leads",
      method: "POST",
      middlewares: [],
      modules: [__api_leads_sync_sheet_js_onRequestPost],
    },
  {
      routePath: "/api/stripe/checkout",
      mountPath: "/api/stripe",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_stripe_checkout_js_onRequestOptions],
    },
  {
      routePath: "/api/stripe/checkout",
      mountPath: "/api/stripe",
      method: "POST",
      middlewares: [],
      modules: [__api_stripe_checkout_js_onRequestPost],
    },
  {
      routePath: "/api/stripe/webhook",
      mountPath: "/api/stripe",
      method: "POST",
      middlewares: [],
      modules: [__api_stripe_webhook_js_onRequestPost],
    },
  {
      routePath: "/admin/client/:token",
      mountPath: "/admin/client",
      method: "GET",
      middlewares: [],
      modules: [__admin_client__token__js_onRequestGet],
    },
  {
      routePath: "/api/leads/:token",
      mountPath: "/api/leads",
      method: "GET",
      middlewares: [],
      modules: [__api_leads__token__js_onRequestGet],
    },
  {
      routePath: "/api/leads/:token",
      mountPath: "/api/leads",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_leads__token__js_onRequestOptions],
    },
  {
      routePath: "/api/leads/:token",
      mountPath: "/api/leads",
      method: "PATCH",
      middlewares: [],
      modules: [__api_leads__token__js_onRequestPatch],
    },
  {
      routePath: "/api/messages/:token",
      mountPath: "/api/messages",
      method: "GET",
      middlewares: [],
      modules: [__api_messages__token__js_onRequestGet],
    },
  {
      routePath: "/api/messages/:token",
      mountPath: "/api/messages",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_messages__token__js_onRequestOptions],
    },
  {
      routePath: "/api/messages/:token",
      mountPath: "/api/messages",
      method: "PATCH",
      middlewares: [],
      modules: [__api_messages__token__js_onRequestPatch],
    },
  {
      routePath: "/api/messages/:token",
      mountPath: "/api/messages",
      method: "POST",
      middlewares: [],
      modules: [__api_messages__token__js_onRequestPost],
    },
  {
      routePath: "/dashboard/:token",
      mountPath: "/dashboard",
      method: "GET",
      middlewares: [],
      modules: [__dashboard__token__js_onRequestGet],
    },
  {
      routePath: "/onboard/:token",
      mountPath: "/onboard",
      method: "GET",
      middlewares: [],
      modules: [__onboard__token__js_onRequestGet],
    },
  {
      routePath: "/preview/:id",
      mountPath: "/preview",
      method: "GET",
      middlewares: [],
      modules: [__preview__id__js_onRequestGet],
    },
  {
      routePath: "/preview/:id",
      mountPath: "/preview",
      method: "OPTIONS",
      middlewares: [],
      modules: [__preview__id__js_onRequestOptions],
    },
  ]