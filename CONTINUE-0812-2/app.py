import os
import sys
from dotenv import load_dotenv
from google import genai
import streamlit as st

# 환경 변수 로드
load_dotenv()

st.set_page_config(
    page_title="고객 피드백 분석기",
    page_icon="🤖",
    layout="centered"
)

def main():
    st.title("📊 고객 피드백 분석기")
    st.markdown("고객 피드백을 입력하면 유형별 해결방법, 이유, 다음 행동을 분석해 드립니다.")

    # API 키 가져오기 (Streamlit secrets 또는 .env 환경 변수 지원)
    api_key = None
    if hasattr(st, "secrets") and "GOOGLE_API_KEY" in st.secrets:
        api_key = st.secrets["GOOGLE_API_KEY"]
    else:
        api_key = os.getenv("GOOGLE_API_KEY")

    if not api_key:
        st.error("Error: GOOGLE_API_KEY가 설정되지 않았습니다. `.env` 파일이나 Streamlit Secrets를 확인해주세요.")
        return

    # 피드백 입력 폼
    feedback = st.text_area("고객 피드백을 입력하세요:", placeholder="예: 배송이 너무 느리고 포장이 파손되어 왔어요.")

    if st.button("분석하기", type="primary"):
        if not feedback.strip():
            st.warning("입력해주세요")
            return

        client = genai.Client(api_key=api_key)
        
        prompt = f"""
다음 고객 피드백을 분석하여 아래 항목 형식으로 답변해주세요.
1. 유형별 해결방법: [허용값 또는 형식]
2. 이유: [허용값 또는 형식]
3. 다음행동: [허용값 또는 형식]

고객 피드백: {feedback}
"""

        with st.spinner("AI가 피드백을 분석 중입니다..."):
            try:
                response = client.models.generate_content(
                    model="gemini-2.5-flash-lite",
                    contents=prompt,
                )
                st.success("분석 완료!")
                st.markdown("### 분석 결과")
                st.markdown(response.text)
            except Exception as e:
                st.error(f"오류가 발생했습니다: {e}")

if __name__ == "__main__":
    main()
