import transformers
from transformers import BitsAndBytesConfig
import torch
import json  # ✅ Import JSON for structured output

compute_dtype = getattr(torch, "float16")
bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type='nf4',
        bnb_4bit_compute_dtype=compute_dtype,
        bnb_4bit_use_double_quant=False,
)

from transformers import AutoModelForCausalLM
model_name = 'microsoft/phi-2'
device_map = {"": 0}
original_model = AutoModelForCausalLM.from_pretrained(model_name,
                                                      device_map=device_map,
                                                      quantization_config=bnb_config,
                                                      trust_remote_code=True,
                                                      use_auth_token=True)

from transformers import AutoTokenizer
tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True,
                                          padding_side="left",
                                          add_eos_token=True, add_bos_token=True,
                                          use_fast=False)
tokenizer.pad_token = tokenizer.eos_token

device = "cuda"

def gen(model, p, maxlen=100, sample=True):
    toks = tokenizer(p, return_tensors="pt").to(device)

    res = model.generate(
        **toks,
        max_new_tokens=maxlen,
        do_sample=sample,
        num_return_sequences=1,
        temperature=0.1,
        num_beams=1,
        top_p=0.95
    )

    return tokenizer.batch_decode(res, skip_special_tokens=True)

from peft import PeftModel
ft_model = PeftModel.from_pretrained(original_model, "./results-1741225651/checkpoint-100",
                                     torch_dtype=torch.float16, is_trainable=False)
from transformers import set_seed
set_seed(42)

import json
import re

def extract_json_from_text(text):
    """Extract JSON content from model output using regex."""
    json_match = re.search(r"\{.*\}", text, re.DOTALL)  # Extract JSON block
    if json_match:
        json_text = json_match.group(0).strip()  # Get matched JSON content
        try:
            return json.loads(json_text)  # Convert to dict
        except json.JSONDecodeError:
            print("❌ JSON Parsing Failed:", json_text)
            return None
    return None

def generate_thinking_style(user_message):
    """Generate thinking style percentages using the fine-tuned model."""

    # ✅ Strictly enforce JSON format in the prompt
    prompt = f"""
    You are an AI that strictly outputs JSON.
    Classify the user's thinking style in percentages.
    
    Respond **only** in this format:
    
    {{
        "concrete": 30,
        "logical": 25,
        "theoretical": 20,
        "practical": 15,
        "intuitive": 10
    }}
    
    User Input: {user_message}
    Output:
    """

    try:
        # ✅ Generate response
        peft_model_res = gen(ft_model, prompt, 100)
        peft_model_output = peft_model_res[0].strip()

        # ✅ Debug Print
        print("Raw Model Output:", peft_model_output)

        # ✅ First Attempt: Parse JSON directly
        try:
            parsed_output = json.loads(peft_model_output)
            return parsed_output  # ✅ If successful, return
        except json.JSONDecodeError:
            pass  # Fall back to regex extraction

        # ✅ Second Attempt: Extract JSON using regex
        extracted_json = extract_json_from_text(peft_model_output)
        if extracted_json:
            return extracted_json

        # If all fails, return default values
        raise ValueError("Could not extract valid JSON")

    except Exception as e:
        print("Error processing model output:", str(e))
        return {"concrete": 0, "logical": 0, "theoretical": 0, "practical": 0, "intuitive": 0}  # Return default
