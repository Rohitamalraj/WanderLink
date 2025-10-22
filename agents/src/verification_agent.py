"""
Verification Agent for WanderLink
Verifies trip completion using AI image analysis
"""

import os
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from dotenv import load_dotenv
from uagents import Agent, Context, Model, Protocol
from openai import OpenAI
import base64
import io
from PIL import Image

load_dotenv()

# Configuration
ASI_ONE_API_KEY = os.environ.get("ASI_ONE_API_KEY")
if not ASI_ONE_API_KEY:
    raise ValueError("ASI_ONE_API_KEY environment variable is required")

# Initialize agent
agent = Agent(
    name="wanderlink_verification_agent",
    port=8004,
    seed="wanderlink_verification_seed_2025",
    mailbox=True,
    endpoint=["http://localhost:8004/submit"]
)

# Models for A2A Communication
class TripVerificationRequest(Model):
    """Request to verify trip completion"""
    user_id: str
    trip_id: str
    destination: str
    trip_description: str
    proof_type: str  # "image_url" or "image_base64"
    proof_data: str  # URL or base64 encoded image
    timestamp: str
    source_agent: str

class TripVerificationResponse(Model):
    """Response from trip verification"""
    success: bool
    user_id: str
    trip_id: str
    verified: bool
    confidence: float
    verdict: str  # "VERIFIED", "NOT_VERIFIED", "NEEDS_REVIEW"
    reasoning: str
    concerns: list
    timestamp: str
    agent_address: str

# REST API Models
class VerificationAPIRequest(Model):
    user_id: str
    trip_id: str
    destination: str
    trip_description: str
    image_url: Optional[str] = None
    image_base64: Optional[str] = None

class VerificationAPIResponse(Model):
    success: bool
    user_id: str
    trip_id: str
    verified: bool
    confidence: float
    verdict: str
    reasoning: str
    concerns: list
    timestamp: str

# Initialize OpenAI client for image analysis (GPT-4 Vision)
vision_client = OpenAI(api_key=ASI_ONE_API_KEY)


def analyze_trip_proof(
    trip_description: str,
    destination: str,
    image_url: str = None,
    image_base64: str = None
) -> Dict[str, Any]:
    """
    Analyze trip proof using GPT-4 Vision
    
    Args:
        trip_description: Description of the trip
        destination: Trip destination
        image_url: URL of the proof image
        image_base64: Base64 encoded image
        
    Returns:
        Verification result dictionary
    """
    try:
        # Prepare the prompt
        prompt = f"""
Analyze this image to verify if it shows proof of trip completion.

TRIP DETAILS:
- Destination: {destination}
- Description: {trip_description}

VERIFICATION CRITERIA:
1. Does the image show the person at or near the destination?
2. Are there recognizable landmarks or location markers?
3. Does the image appear to be recent and authentic?
4. Is there evidence of actual travel (boarding passes, tickets, location tags)?

TASK: Analyze the image and return your assessment in this exact format:

VERDICT: [VERIFIED/NOT_VERIFIED/NEEDS_REVIEW]
CONFIDENCE: [0-100]
REASONING: [Brief explanation of your decision]
CONCERNS: [List any concerns, or "None" if verified]

Be thorough but concise.
"""
        
        # Prepare the image input
        image_input = None
        if image_url:
            image_input = {"type": "image_url", "image_url": {"url": image_url}}
        elif image_base64:
            # For base64, we need to prefix with data URL
            if not image_base64.startswith('data:image'):
                image_base64 = f"data:image/jpeg;base64,{image_base64}"
            image_input = {"type": "image_url", "image_url": {"url": image_base64}}
        else:
            return {
                "verified": False,
                "confidence": 0,
                "verdict": "NOT_VERIFIED",
                "reasoning": "No image provided for verification",
                "concerns": ["No proof image submitted"]
            }
        
        # Call GPT-4 Vision
        response = vision_client.chat.completions.create(
            model="gpt-4o",  # GPT-4 with vision
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        image_input
                    ]
                }
            ],
            max_tokens=500
        )
        
        # Parse the response
        result_text = response.choices[0].message.content
        
        # Extract verdict, confidence, reasoning
        verdict = "NEEDS_REVIEW"
        confidence = 50
        reasoning = "Unable to parse verification result"
        concerns = ["Verification parsing failed"]
        
        lines = result_text.strip().split('\n')
        for line in lines:
            if line.startswith('VERDICT:'):
                verdict = line.split(':', 1)[1].strip()
            elif line.startswith('CONFIDENCE:'):
                try:
                    confidence = float(line.split(':', 1)[1].strip())
                except:
                    confidence = 50
            elif line.startswith('REASONING:'):
                reasoning = line.split(':', 1)[1].strip()
            elif line.startswith('CONCERNS:'):
                concern_text = line.split(':', 1)[1].strip()
                if concern_text.lower() != 'none':
                    concerns = [c.strip() for c in concern_text.split(',')]
                else:
                    concerns = []
        
        verified = verdict == "VERIFIED"
        
        return {
            "verified": verified,
            "confidence": confidence,
            "verdict": verdict,
            "reasoning": reasoning,
            "concerns": concerns
        }
        
    except Exception as e:
        print(f"❌ Error in trip proof analysis: {e}")
        return {
            "verified": False,
            "confidence": 0,
            "verdict": "NOT_VERIFIED",
            "reasoning": f"Verification failed: {str(e)}",
            "concerns": ["Technical error during verification"]
        }


# A2A Communication Protocol
verification_protocol = Protocol("TripVerification")

@verification_protocol.on_message(model=TripVerificationRequest)
async def handle_verification_request(ctx: Context, sender: str, msg: TripVerificationRequest):
    """Handle trip verification request from other agents"""
    ctx.logger.info(f"📨 Received verification request from {sender}")
    ctx.logger.info(f"   User: {msg.user_id}, Trip: {msg.trip_id}, Destination: {msg.destination}")
    
    # Analyze the proof
    image_url = msg.proof_data if msg.proof_type == "image_url" else None
    image_base64 = msg.proof_data if msg.proof_type == "image_base64" else None
    
    result = analyze_trip_proof(
        trip_description=msg.trip_description,
        destination=msg.destination,
        image_url=image_url,
        image_base64=image_base64
    )
    
    # Create response
    response = TripVerificationResponse(
        success=True,
        user_id=msg.user_id,
        trip_id=msg.trip_id,
        verified=result['verified'],
        confidence=result['confidence'],
        verdict=result['verdict'],
        reasoning=result['reasoning'],
        concerns=result['concerns'],
        timestamp=datetime.now(timezone.utc).isoformat(),
        agent_address=ctx.agent.address
    )
    
    # Send response back
    await ctx.send(sender, response)
    
    ctx.logger.info(f"✅ Verification complete: {result['verdict']} (confidence: {result['confidence']}%)")


# Register protocol
agent.include(verification_protocol)


# REST API Endpoint
@agent.on_rest_post("/api/verify-trip", VerificationAPIRequest, VerificationAPIResponse)
async def verify_trip_endpoint(ctx: Context, req: VerificationAPIRequest) -> VerificationAPIResponse:
    """REST API endpoint for trip verification"""
    ctx.logger.info(f"🔍 REST API: Verifying trip for user {req.user_id}")
    
    # Analyze the proof
    result = analyze_trip_proof(
        trip_description=req.trip_description,
        destination=req.destination,
        image_url=req.image_url,
        image_base64=req.image_base64
    )
    
    return VerificationAPIResponse(
        success=True,
        user_id=req.user_id,
        trip_id=req.trip_id,
        verified=result['verified'],
        confidence=result['confidence'],
        verdict=result['verdict'],
        reasoning=result['reasoning'],
        concerns=result['concerns'],
        timestamp=datetime.now(timezone.utc).isoformat()
    )


@agent.on_event("startup")
async def startup(ctx: Context):
    """Agent startup event"""
    ctx.logger.info("=" * 60)
    ctx.logger.info("🚀 WanderLink Verification Agent Started!")
    ctx.logger.info("=" * 60)
    ctx.logger.info(f"Agent Address: {ctx.agent.address}")
    ctx.logger.info(f"Port: 8004")
    ctx.logger.info(f"Endpoint: http://localhost:8004/submit")
    ctx.logger.info("=" * 60)
    ctx.logger.info("✅ Ready to verify trip completions!")
    ctx.logger.info("")


if __name__ == "__main__":
    agent.run()
