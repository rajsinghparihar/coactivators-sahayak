from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
import mermaid as md



def generate_image_from_prompt(prompt: str) -> str:
    client = genai.Client()
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_modalities=["TEXT", "IMAGE"]
        ),
    )
    # Process the response to extract and display/save the image
    for part in response.candidates[0].content.parts:
        if part.inline_data is not None:
            image = Image.open(BytesIO(part.inline_data.data))
            image.save("ai_generated_output.png")
            image.show()
    return "image_saved"


def render_mermaid_diagram(mermaid_code: str) -> str:
    """Convert Mermaid diagram code into an SVG file and return the filename.

    Args:
        mermaid_code: Valid Mermaid DSL string.

    Returns:
        Path to the generated SVG file (relative).
    """
    output_path = "mermaid_diagram.svg"
    svg_output = md.Mermaid(mermaid_code).to_svg(path=output_path)
    

    # with open(output_path, "w", encoding="utf-8") as f:
    #     f.write(svg_output)
    return output_path



