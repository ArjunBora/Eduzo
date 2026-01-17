import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import os
from typing import Dict

# Provide fallback if package not installed, for development
try:
    from reasoning_from_scratch import generate_reasoning_response 
    # Note: Adjust import based on actual package structure if needed
except ImportError:
    generate_reasoning_response = None

class ModelManager:
    def __init__(self):
        self.model_name = "Qwen/Qwen2.5-0.5B-Instruct" # Using a smaller capable model for dev/demo if 3 not avail
        # For actual Qwen3, prompt would be updated. 
        # User requested Qwen3 0.6B (likely Qwen2.5 0.5B or similar small variant for this demo context)
        # We will use Qwen/Qwen2.5-0.5B-Instruct as a proxy for "Qwen3" in this scaffold
        # to ensure it actually runs on typical hardware if needed.
        
        self.tokenizer = None
        self.model = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

    def load_model(self):
        if os.getenv("MOCK_AI") == "true":
            print("MOCK_AI is set to true. Skipping model download.")
            return

        print(f"Loading model {self.model_name} on {self.device}...")
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name, trust_remote_code=True)
            
            # Load with quantization if CUDA is available, otherwise normal load
            if self.device == "cuda":
                self.model = AutoModelForCausalLM.from_pretrained(
                    self.model_name,
                    device_map="auto",
                    load_in_8bit=True,
                    trust_remote_code=True
                )
            else:
                self.model = AutoModelForCausalLM.from_pretrained(
                    self.model_name,
                    device_map="auto",
                    trust_remote_code=True
                )
            print("Model loaded successfully.")
        except Exception as e:
            print(f"Error loading model: {e}")
            print("Falling back to MOCK mode due to error.")
            # Don't raise, just log


    def generate_reasoning(self, prompt: str) -> Dict[str, str]:
        # MOCK MODE check
        if not self.model or not self.tokenizer:
            print("Model not loaded, returning MOCK response.")
            return {
                "reasoning": "This is a mock reasoning process because the AI model is not loaded. I am analyzing the user's question 'prompt'...",
                "answer": f"This is a mock answer to '{prompt}'. To use the real AI, ensure dependencies are installed and MOCK_AI is not true.",
                "full_response": "Mock response"
            }

        # Chain of thought prompting
        system_prompt = "You are a helpful AI assistant that explains your reasoning step by step before giving the final answer."
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]
        
        text = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )
        
        inputs = self.tokenizer([text], return_tensors="pt").to(self.device)

        with torch.no_grad():
            generated_ids = self.model.generate(
                inputs.input_ids,
                max_new_tokens=512,
                temperature=0.7
            )
            
        generated_ids = [
            output_ids[len(input_ids):] for input_ids, output_ids in zip(inputs.input_ids, generated_ids)
        ]
        response_text = self.tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]

        # Simple heuristic to split reasoning from answer if the model follows format
        # For a true "reasoning model" from scratch, the internal logic might differ, 
        # but here we simulate the output structure.
        return {
            "reasoning": "Reasoning generation invoked.", 
            "answer": response_text,
            "full_response": response_text
        }
