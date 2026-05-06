"""
AI Service: Uses OpenAI to generate trading insights from performance data.
"""
from typing import List, Dict, Any, Optional
import json


SYSTEM_PROMPT = """You are an expert trading performance analyst AI embedded in ProJournX, 
a professional trading journal platform. You analyze traders' performance data and provide 
actionable insights to improve consistency, identify patterns, and flag psychological issues.

Your insights should be:
- Specific and data-driven (reference exact percentages, numbers)
- Actionable (give concrete steps the trader can take)
- Concise but impactful
- Professional and encouraging

Always return valid JSON matching the requested schema."""


def _build_analysis_prompt(metrics: Dict[str, Any], trades_summary: Dict[str, Any]) -> str:
    return f"""Analyze this trader's performance data and generate 5 actionable insights:

PERFORMANCE METRICS:
- Win Rate: {metrics.get('win_rate', 0)}%
- Profit Factor: {metrics.get('profit_factor', 0)}
- Total P&L: ${metrics.get('total_pnl', 0)}
- Avg R:R: {metrics.get('avg_rr', 0)}
- Max Drawdown: {metrics.get('max_drawdown', 0)}%
- Total Trades: {metrics.get('total_trades', 0)}
- Avg Win: ${metrics.get('avg_win', 0)}
- Avg Loss: ${metrics.get('avg_loss', 0)}
- Max Win Streak: {metrics.get('max_consecutive_wins', 0)}
- Max Loss Streak: {metrics.get('max_consecutive_losses', 0)}

PATTERN BREAKDOWN:
{json.dumps(trades_summary, indent=2)}

Generate exactly 5 insights in this JSON format:
{{
  "insights": [
    {{
      "type": "pattern|warning|opportunity|achievement|psychology",
      "impact": "high|medium|low",
      "title": "Short descriptive title",
      "description": "Detailed analysis with specific numbers",
      "action": "Specific actionable recommendation"
    }}
  ]
}}"""


async def generate_ai_insights(
    metrics: Dict[str, Any],
    trades_summary: Dict[str, Any],
    api_key: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Generate AI-powered trading insights using OpenAI."""
    if not api_key:
        return _generate_rule_based_insights(metrics, trades_summary)

    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=api_key)

        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": _build_analysis_prompt(metrics, trades_summary)},
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
            max_tokens=1500,
        )

        data = json.loads(response.choices[0].message.content)
        return data.get("insights", [])

    except Exception as e:
        print(f"OpenAI API error: {e}")
        return _generate_rule_based_insights(metrics, trades_summary)


def _generate_rule_based_insights(
    metrics: Dict[str, Any],
    trades_summary: Dict[str, Any],
) -> List[Dict[str, Any]]:
    """Fallback: generate insights using rule-based logic."""
    insights = []
    win_rate = metrics.get("win_rate", 0)
    max_dd = metrics.get("max_drawdown", 0)
    profit_factor = metrics.get("profit_factor", 0)
    avg_rr = metrics.get("avg_rr", 0)

    # Win rate analysis
    if win_rate >= 65:
        insights.append({
            "type": "achievement", "impact": "high",
            "title": f"Strong {win_rate}% Win Rate",
            "description": f"Your {win_rate}% win rate is above the professional trader benchmark of 60%. "
                           f"This places you in the top tier of consistent traders.",
            "action": "Maintain your current trade selection criteria and avoid overtrading to preserve this edge.",
        })
    elif win_rate < 50:
        insights.append({
            "type": "warning", "impact": "high",
            "title": f"Win Rate Below 50% ({win_rate}%)",
            "description": f"Your {win_rate}% win rate means you lose more often than you win. "
                           f"This is only sustainable with a high R:R ratio.",
            "action": "Focus on improving trade selection or increase your minimum R:R requirement to 1:3.",
        })

    # Drawdown analysis
    if max_dd > 15:
        insights.append({
            "type": "warning", "impact": "high",
            "title": f"High Drawdown at {max_dd:.1f}%",
            "description": f"Your maximum drawdown of {max_dd:.1f}% is dangerously high. "
                           f"Professional risk management targets <10% max drawdown.",
            "action": "Immediately reduce position sizes to 0.5% risk per trade until drawdown recovers.",
        })
    elif max_dd <= 5:
        insights.append({
            "type": "achievement", "impact": "medium",
            "title": f"Excellent Risk Control ({max_dd:.1f}% DD)",
            "description": f"Your {max_dd:.1f}% max drawdown demonstrates exceptional risk management discipline.",
            "action": "Your risk management is excellent. Consider gradually increasing position sizes to 1.5%.",
        })

    # Profit factor
    if profit_factor >= 3:
        insights.append({
            "type": "pattern", "impact": "high",
            "title": f"Elite Profit Factor of {profit_factor}x",
            "description": f"A {profit_factor}x profit factor means you earn ${profit_factor:.1f} for every $1 risked. "
                           f"Hedge funds target 1.5x; you're significantly above.",
            "action": "Document exactly what is working and create formal playbook entries for your best setups.",
        })

    # R:R analysis
    if avg_rr >= 2.5:
        insights.append({
            "type": "opportunity", "impact": "medium",
            "title": f"Strong Risk:Reward at 1:{avg_rr}",
            "description": f"Your average 1:{avg_rr} R:R means you can be profitable with as low as "
                           f"{100 / (1 + avg_rr):.0f}% win rate.",
            "action": "Your R:R is excellent. Focus on maintaining consistency rather than seeking higher targets.",
        })
    elif avg_rr < 1.5:
        insights.append({
            "type": "warning", "impact": "medium",
            "title": f"Low R:R Ratio (1:{avg_rr})",
            "description": f"Your average 1:{avg_rr} R:R is below the recommended 1:2 minimum. "
                           f"This makes consistent profitability challenging.",
            "action": "Move your take profit targets further or tighten stop losses on each setup.",
        })

    # Psychology
    psychology = trades_summary.get("psychology", [])
    if psychology:
        best_emotion = psychology[0]
        worst_emotion = psychology[-1] if len(psychology) > 1 else None
        insights.append({
            "type": "psychology", "impact": "high",
            "title": f"'{best_emotion.get('emotion')}' is Your Best Mental State",
            "description": f"You win {best_emotion.get('win_rate', 0)}% of trades when feeling '{best_emotion.get('emotion')}'. "
                           + (f"Trades when '{worst_emotion.get('emotion')}' only produce {worst_emotion.get('win_rate', 0)}% win rate." if worst_emotion else ""),
            "action": f"Build a pre-trade checklist that ensures you only enter trades when feeling '{best_emotion.get('emotion')}'.",
        })

    return insights[:5]


async def analyze_trade_note(note: str, api_key: Optional[str] = None) -> Dict[str, Any]:
    """Use AI to analyze a trade note for psychological patterns."""
    if not api_key:
        return {"sentiment": "neutral", "keywords": [], "suggestion": "Add an OpenAI API key for AI note analysis."}

    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=api_key)

        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a trading psychology analyst. Analyze this trade note for emotional state and provide JSON output."},
                {"role": "user", "content": f'Analyze this trade note and return JSON with sentiment (positive/negative/neutral), keywords (array), and a brief suggestion:\n\n"{note}"'},
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
            max_tokens=300,
        )
        return json.loads(response.choices[0].message.content)
    except Exception:
        return {"sentiment": "neutral", "keywords": [], "suggestion": "AI analysis unavailable."}
