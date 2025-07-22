1. **Core Objective**
    
    Develop an AI-powered system that enables teachers to quickly generate **differentiated study materials and practice worksheets** from textbook pages (input as images), automatically tailored to multiple grade levels and learning needs within a single classroom.
    
2. **IO:**
    - Inputs:
        - Textbook page Image(s)
        - Grades e.g. (4th, 5th) (parsed from user query)
        - worksheet config (number of questions, type of questions (MCQ, Fill in the blanks, etc.))
        - Additional Text input regarding topic (Optional)
    - Outputs:
        - returns or populates DB with `n_grades` Worksheets. one for each grade.
3. **Key Constraints**
    - **Device Compatibility**: Must function smoothly on low-spec Android devices commonly found in schools.
    - **Network Efficiency**: All data exchanges and outputs should be lightweight and image, text-based to accommodate low-bandwidth environments.
    - **Accessibility**: Materials must be easy to print or display, and simple for students to use independently.
    - **Language Support**: The system should process and generate content in local languages as needed.
    - **Differentiation Depth**: Generated materials must be adapted for varying reading levels, cognitive abilities, and learning styles.
    - **Teacher Control**: Allow teachers to review and edit generated materials before sharing with students.
4. **Agentic Design: Multi-Tool Approach**
    
    A Router agent analyzes the input and teacher’s requirements, then orchestrates a set of specialized tools:
    
    - **Document Parser (OCR/LLM based)**: Converts textbook images to editable text.
    - **Worksheet Generator**: Creates varied activities (e.g., MCQs, fill-in-the-blanks, open-ended questions) for each grade.
        - **Content Simplifier**: Simplifies the language of worksheet questions to make it easy to understand for lower grade students
    - **Visual Aid Tool**: Can be utilized here to generate illustrations to explain a practice question
    - **Translator**: Translates and localizes content as required.
    
5. **Process Flow: Think, Then Act**
    - **User Input**: Teacher uploads textbook images and specifies classroom grades and learning needs.
    - **Think (Back-End)**:
        - Parser tool extracts text.
        - Decider agent analyzes content and differentiation requirements.
        - Generates a JSON plan specifying which tools to use for each grade and learning style.
    - **Act (Back-End & Front-End)**:
        - Each tool processes the relevant content.
        - Outputs include printable worksheets, reading passages at different levels, visual aids.
        - Teacher reviews, edits, and distributes materials (md report) (print or teacher writes on blackboard).
6. **Technology Stack**
    - **OCR/LLM based**: Dolphin OCR or Google alternative or Gemma Models.
    - **AI Models**: Lightweight LLMs (Gemma, or Gemini Flash) for summarization, question generation, and content simplification.
    - **Front-End**: React, Vite for web app or React native for Android App
    - **Back-End**: FastAPI servers or Firebase Functions.
    - **Storage**: Firestore for user data and generated materials.
7. **Memory**
    - **In Memory Tracking for workflow steps. (Global)**
    - **User Tracking**: Store teacher inputs, extracted content, and generated workflow in Firestore for future analytics.
    
8. **Guardrails & Limitations**
    - **Content Safety**: Built-in filters to block inappropriate or sensitive material.
    - **Complexity Control**: Refuse to generate materials that are too advanced or too simplistic for the specified grades, and prompt the teacher for clarification.
    - **Tool Limitations**: If a requested differentiation is not feasible, the system asks for a simpler or alternative request.
    - **Transparency**: Clearly label sample answers or AI-generated data as “Example.”
    - **Scope Enforcement**: Restrict usage to educational content generation for differentiation; deny unrelated requests.