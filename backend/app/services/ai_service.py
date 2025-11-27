"""
AI Services for Relaywork
Handles AI-powered features like Smart Project Briefs
"""
import json
import os
from typing import Dict, Any
from openai import OpenAI
from anthropic import Anthropic


class AIService:
    """Service for AI-powered features"""

    def __init__(self):
        self.openai_client = None
        self.anthropic_client = None

        # Initialize OpenAI if API key is available
        openai_key = os.getenv("OPENAI_API_KEY")
        if openai_key:
            self.openai_client = OpenAI(api_key=openai_key)

        # Initialize Anthropic if API key is available
        anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        if anthropic_key:
            self.anthropic_client = Anthropic(api_key=anthropic_key)

    def generate_project_brief(
        self,
        raw_description: str,
        project_type: str,
        reference_context: str = ""
    ) -> Dict[str, Any]:
        """
        Generate a structured project brief from raw description using AI

        Args:
            raw_description: User's description of what they want built
            project_type: Type of project (chatbot, automation, fine-tune, etc.)
            reference_context: Optional context from reference files

        Returns:
            Dict with structured project brief data
        """

        prompt = self._build_brief_prompt(raw_description, project_type, reference_context)

        # Try OpenAI first, fallback to Anthropic
        if self.openai_client:
            return self._generate_with_openai(prompt)
        elif self.anthropic_client:
            return self._generate_with_anthropic(prompt)
        else:
            raise Exception("No AI provider configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY")

    def _build_brief_prompt(self, description: str, project_type: str, reference_context: str = "") -> str:
        """Build the prompt template for brief generation"""

        reference_section = f"REFERENCE CONTEXT:\n{reference_context}\n" if reference_context else ""

        return f"""You are an AI project scoping assistant for Relaywork, a platform connecting AI freelancers with companies.

Your task is to transform a vague project description into a clear, structured project brief that freelancers can understand and bid on.

PROJECT TYPE: {project_type}
CLIENT DESCRIPTION:
{description}

{reference_section}
Generate a comprehensive project brief with the following structure. Return ONLY valid JSON:

{{
  "goal": "Clear, specific main objective in 1-2 sentences",
  "deliverables": [
    "Specific, measurable deliverable 1",
    "Specific, measurable deliverable 2",
    "..."
  ],
  "tech_stack": [
    "Technology/tool 1",
    "Technology/tool 2",
    "..."
  ],
  "steps": [
    "Implementation step 1",
    "Implementation step 2",
    "..."
  ],
  "estimated_timeline": "2-3 weeks" or "1 month" etc,
  "estimated_budget_min": 1500,
  "estimated_budget_max": 3000,
  "required_skills": [
    "Skill 1",
    "Skill 2",
    "..."
  ],
  "confidence_score": 0.85
}}

Guidelines:
- Be specific and actionable
- For {project_type} projects, recommend appropriate AI tools and frameworks
- Budget should be realistic for the scope (typical range: $500-$10,000 for MVP)
- Timeline should be realistic (1 week to 3 months typical)
- Required skills should match the tech stack
- Confidence score: 0-1 based on how clear the requirements are
- If the description is vague, make reasonable assumptions but lower confidence score

Return ONLY the JSON object, no other text."""

    def _generate_with_openai(self, prompt: str) -> Dict[str, Any]:
        """Generate brief using OpenAI GPT-4"""
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful AI project scoping assistant. Always return valid JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=2000,
                response_format={"type": "json_object"}
            )

            content = response.choices[0].message.content
            result = json.loads(content)
            result["ai_model_used"] = "gpt-4-turbo-preview"
            return result

        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")

    def _generate_with_anthropic(self, prompt: str) -> Dict[str, Any]:
        """Generate brief using Anthropic Claude"""
        try:
            response = self.anthropic_client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=2000,
                temperature=0.7,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            content = response.content[0].text
            # Extract JSON from response
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()

            result = json.loads(content)
            result["ai_model_used"] = "claude-3-5-sonnet-20241022"
            return result

        except Exception as e:
            raise Exception(f"Anthropic API error: {str(e)}")


# Singleton instance
ai_service = AIService()
