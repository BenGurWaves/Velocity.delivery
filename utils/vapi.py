import os
import httpx
import structlog
from typing import Any, Dict, Optional

log = structlog.get_logger()

class VapiClient:
    """Unified client for interacting with the Vapi.ai API."""
    
    def __init__(self, api_key: str = None, assistant_id: str = None, phone_number_id: str = None):
        self.api_key = api_key or os.getenv("VAPI_API_KEY")
        self.assistant_id = assistant_id or os.getenv("VAPI_ASSISTANT_ID")
        self.phone_number_id = phone_number_id or os.getenv("VAPI_PHONE_NUMBER_ID")
        self.base_url = "https://api.vapi.ai/call"
        
        if not self.api_key:
            log.warning("vapi.missing_api_key", msg="VAPI_API_KEY not found in environment")

    async def make_call(
        self, 
        phone_number: str, 
        name: str = "Valued Customer",
        assistant_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Initiate an outbound phone call.
        
        Args:
            phone_number: Destination number in E.164 format (+1XXXXXXXXXX)
            name: Name of the person being called
            assistant_id: Optional override for the assistant ID
            metadata: Optional metadata to attach to the call
            
        Returns:
            The Vapi API response as a dictionary.
        """
        aid = assistant_id or self.assistant_id
        if not aid:
            raise ValueError("Assistant ID is required to make a call.")
            
        payload = {
            "assistantId": aid,
            "phoneNumberId": self.phone_number_id,
            "customer": {
                "number": phone_number,
                "name": name
            }
        }
        
        if metadata:
            payload["metadata"] = metadata
            
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        log.info("vapi.initiating_call", name=name, phone=phone_number, assistant=aid)
        
        async with httpx.AsyncClient(timeout=30) as client:
            try:
                response = await client.post(self.base_url, json=payload, headers=headers)
                response.raise_for_status()
                result = response.json()
                log.info("vapi.call_initiated", call_id=result.get("id"), status=result.get("status"))
                return result
            except httpx.HTTPStatusError as exc:
                log.error("vapi.api_error", status=exc.response.status_code, text=exc.response.text)
                raise
            except Exception as exc:
                log.error("vapi.unexpected_error", error=str(exc))
                raise

async def call_lead(phone: str, name: str, metadata: Optional[Dict] = None):
    """Convenience function to call a lead using environment credentials."""
    client = VapiClient()
    return await client.make_call(phone_number=phone, name=name, metadata=metadata)
