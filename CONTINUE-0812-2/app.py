import os
import sys
from dotenv import load_dotenv
from google import genai

def main():
    load_dotenv()
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("Error: GOOGLE_API_KEY not found in environment variables.")
        sys.exit(1)

    try:
        feedback = input("고객 피드백: ").strip()
    except EOFError:
        feedback = ""

    if not feedback:
        print("입력해주세요")
        return

    client = genai.Client(api_key=api_key)
    
    prompt = f"""
다음 고객 피드백을 분석하여 아래 항목 형식으로 답변해주세요.
1. 유형별 해결방법: [허용값 또는 형식]
2. 이유: [허용값 또는 형식]
3. 다음행동: [허용값 또는 형식]

고객 피드백: {feedback}
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt,
        )
        print(response.text)
    except Exception as e:
        print(e)
        sys.exit(1)

if __name__ == "__main__":
    main()
