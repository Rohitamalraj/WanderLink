import httpx

url = "http://127.0.0.1:8002/send"  # local Travel Agent
payload = {"test": "ping"}
response = httpx.post(url, json=payload)
print(response.status_code, response.text)
