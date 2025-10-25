"""
Test script for Agentverse Mailbox API integration
Run this to verify that messages are being sent to deployed agents
"""

import requests
import json
from datetime import datetime

# Configuration
AGENT_SERVICE_URL = "http://localhost:8000"
TRAVEL_AGENT_ADDRESS = "agent1q0z4x0eugfdax0ww4wxrqeqwcuusga0nuwzj9ny9zfuuc6c52wfyx3t8gey"
MATCHMAKER_ADDRESS = "agent1qdsd9mu8uhgkruel696xp532q7kuqzgc9wknnt5w5u57rg0atf5v2v5nrmt"

def test_send_to_travel_agent():
    """Test sending a message directly to Travel Agent on Agentverse"""
    print("\n" + "="*60)
    print("TEST 1: Send message to Travel Agent")
    print("="*60)
    
    payload = {
        "userId": "test_user_123",
        "nlpInput": "I want to go to Bali for 7 days with beach and adventure activities"
    }
    
    print(f"📤 Sending: {payload['nlpInput']}")
    
    try:
        response = requests.post(
            f"{AGENT_SERVICE_URL}/api/send-to-travel-agent",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📄 Response:")
        print(json.dumps(response.json(), indent=2))
        
        if response.status_code == 200:
            print("✅ TEST PASSED: Message sent successfully!")
        else:
            print("❌ TEST FAILED: Unexpected status code")
            
    except Exception as e:
        print(f"❌ TEST FAILED: {str(e)}")
    
    print("="*60)


def test_extract_and_send():
    """Test hybrid approach: extract preferences + send to agent"""
    print("\n" + "="*60)
    print("TEST 2: Extract preferences AND send to agent (Hybrid)")
    print("="*60)
    
    payload = {
        "userId": "test_user_456",
        "nlpInput": "Looking for a relaxing beach vacation in Maldives, budget around $3000, 5 days"
    }
    
    print(f"📤 Sending: {payload['nlpInput']}")
    
    try:
        response = requests.post(
            f"{AGENT_SERVICE_URL}/api/extract-preferences-and-send",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📄 Response:")
        print(json.dumps(response.json(), indent=2))
        
        if response.status_code == 200:
            result = response.json()
            print("\n✅ TEST PASSED!")
            print(f"📝 Extracted Preferences: {result.get('preferences', {})}")
            print(f"🤖 Agent Response: {result.get('agent_response', {})}")
            
            # Get task status
            task_id = result.get('task_id')
            if task_id:
                print(f"\n🔍 Checking task status...")
                status_response = requests.get(
                    f"{AGENT_SERVICE_URL}/api/task-status/{task_id}"
                )
                print(f"📊 Task Status:")
                print(json.dumps(status_response.json(), indent=2))
        else:
            print("❌ TEST FAILED: Unexpected status code")
            
    except Exception as e:
        print(f"❌ TEST FAILED: {str(e)}")
    
    print("="*60)


def test_send_to_matchmaker():
    """Test sending preferences to MatchMaker agent"""
    print("\n" + "="*60)
    print("TEST 3: Send preferences to MatchMaker")
    print("="*60)
    
    payload = {
        "userId": "test_user_789",
        "preferences": {
            "destination": "Thailand",
            "duration": "10 days",
            "budget": "$2500",
            "travel_type": "adventure",
            "interests": ["beach", "scuba diving", "nightlife"]
        }
    }
    
    print(f"📤 Sending preferences to MatchMaker")
    
    try:
        response = requests.post(
            f"{AGENT_SERVICE_URL}/api/send-to-matchmaker",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📄 Response:")
        print(json.dumps(response.json(), indent=2))
        
        if response.status_code == 200:
            print("✅ TEST PASSED: Preferences sent to MatchMaker!")
        else:
            print("❌ TEST FAILED: Unexpected status code")
            
    except Exception as e:
        print(f"❌ TEST FAILED: {str(e)}")
    
    print("="*60)


def test_health_check():
    """Test basic health check"""
    print("\n" + "="*60)
    print("TEST 0: Health Check")
    print("="*60)
    
    try:
        response = requests.get(f"{AGENT_SERVICE_URL}/health")
        print(f"📊 Status Code: {response.status_code}")
        print(f"📄 Response:")
        print(json.dumps(response.json(), indent=2))
        
        if response.status_code == 200:
            print("✅ Service is healthy!")
        else:
            print("❌ Service health check failed")
            
    except Exception as e:
        print(f"❌ Cannot connect to service: {str(e)}")
        print(f"💡 Make sure agent service is running: python -m uvicorn agent_service:app --reload")
        return False
    
    print("="*60)
    return True


if __name__ == "__main__":
    print("\n" + "="*60)
    print("🧪 AGENTVERSE MAILBOX API INTEGRATION TESTS")
    print("="*60)
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 Agent Service: {AGENT_SERVICE_URL}")
    print(f"🤖 Travel Agent: {TRAVEL_AGENT_ADDRESS[:30]}...")
    print(f"🤖 MatchMaker: {MATCHMAKER_ADDRESS[:30]}...")
    print("="*60)
    
    # Run tests
    if test_health_check():
        test_send_to_travel_agent()
        test_extract_and_send()
        test_send_to_matchmaker()
        
        print("\n" + "="*60)
        print("🎯 TEST SUITE COMPLETE")
        print("="*60)
        print("\n💡 Next Steps:")
        print("1. Check Agentverse console to see if agents received messages")
        print("2. Go to: https://agentverse.ai/agents")
        print("3. Click on your Travel Agent")
        print("4. Check the 'Messages' or 'Logs' tab")
        print("5. You should see the messages we just sent!")
        print("\n" + "="*60 + "\n")
    else:
        print("\n❌ Tests aborted - service not available\n")
