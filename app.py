import streamlit as st
import pandas as pd
import requests
from bs4 import BeautifulSoup
import matplotlib.pyplot as plt
import openai

# ========== CONFIG ==========
KIWI_API_KEY = "your_kiwi_api_key"
OPENAI_API_KEY = "your_openai_api_key"
openai.api_key = OPENAI_API_KEY

# ========== DATA SCRAPING ==========
def fetch_scraped_data():
    url = "https://example.com/popular-flights"
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        rows = soup.select(".flight-row")

        data = []
        for row in rows:
            route = row.select_one(".route").text
            price = row.select_one(".price").text
            date = row.select_one(".date").text
            data.append({"route": route, "price": float(price.replace("$", "")), "date": date})

        return data
    except Exception:
        return []

# ========== API INTEGRATION ==========
def fetch_kiwi_data(fly_from="SYD", fly_to="MEL"):
    url = "https://api.tequila.kiwi.com/v2/search"
    headers = {"apikey": KIWI_API_KEY}
    params = {
        "fly_from": fly_from,
        "fly_to": fly_to,
        "date_from": "12/07/2025",
        "date_to": "20/07/2025",
        "limit": 20
    }

    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        flights = response.json().get("data", [])
        data = [
            {
                "route": f"{f['cityFrom']} → {f['cityTo']}",
                "price": f['price'],
                "date": f['local_departure'].split("T")[0]
            } for f in flights
        ]
        return data
    else:
        return []

# ========== DATA PROCESSING ==========
def process_data(data):
    if not data:
        return {}, pd.DataFrame()

    df = pd.DataFrame(data)
    df['date'] = pd.to_datetime(df['date'])

    insights = {
        "popular_routes": df['route'].value_counts().head(5),
        "avg_price_per_route": df.groupby('route')['price'].mean().sort_values(ascending=False),
        "price_trend": df.groupby('date')['price'].mean()
    }
    return insights, df

# ========== AI SUMMARY (OPTIONAL) ==========
def explain_with_ai(insights):
    summary = (
        f"Popular Routes: {insights['popular_routes'].to_dict()}.\n"
        f"Avg Prices: {insights['avg_price_per_route'].to_dict()}.\n"
        f"Price Trends: {insights['price_trend'].to_dict()}.\n"
    )

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a travel analyst helping hostels understand airline demand."},
                {"role": "user", "content": f"Analyze this data: {summary}"}
            ]
        )
        return response.choices[0].message['content']
    except Exception as e:
        return f"AI analysis unavailable. Error: {e}"

# ========== STREAMLIT UI ==========
# ========== STREAMLIT UI ==========
st.set_page_config(page_title="Airline Demand Dashboard", layout="wide")
st.title("✈️ Airline Booking Market Demand")
st.markdown("Analyze flight demand trends to improve hostel strategy")


source = st.selectbox("Select data source", ["Kiwi API", "Scraped Web Data"])
if source == "Kiwi API":
    fly_from = st.text_input("Fly From", "SYD")
    fly_to = st.text_input("Fly To", "MEL")
    raw_data = fetch_kiwi_data(fly_from, fly_to)
else:
    st.warning("Using dummy scraped data.")
    raw_data = fetch_scraped_data()

insights, df = process_data(raw_data)

if not df.empty:
    col1, col2 = st.columns(2)
    with col1:
        st.subheader("Popular Routes")
        st.bar_chart(insights["popular_routes"])
    with col2:
        st.subheader("Average Price per Route")
        st.bar_chart(insights["avg_price_per_route"])

    st.subheader("Price Trend Over Time")
    st.line_chart(insights["price_trend"])

    if st.checkbox("Explain with AI"):
        explanation = explain_with_ai(insights)
        st.markdown("### 🤖 AI Insight Summary")
        st.info(explanation)
else:
    st.error("No data found. Try different routes or check API key.")
