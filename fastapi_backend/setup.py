import smtplib,os   
from dotenv import load_dotenv
load_dotenv()
from langchain_mistralai import ChatMistralAI
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

EMAIL = "courage9605@gmail.com"
APP_PASSWORD = "ecqiohmxxjsfglsw"  

llm = ChatMistralAI(model="mistral-small-latest",api_key=os.getenv("MISTRAL_API_KEY"))


to_email = "bt23cse182@iiitn.ac.in"
subject = "Test Email from OpenClaw 🦀"

body = 'Dear NIGGER\n\n'
body += llm.invoke("Write a long, highly detailed email body addressed to a friend, using a witty, sarcastic, and slightly absurd tone to address his overly pessimistic attitude and his excessive obsession with reading manhuas, mangas, and comics like a stereotypical otaku. The humor should be exaggerated, dramatic, and creatively teasing in a playful way, without being genuinely offensive.Portray his pessimism as comically extreme and his reading habits as humorously over-the-top, using vivid descriptions and escalating sarcasm.Do not include a subject line, greeting, closing phrases, or any signature/name.Only output the email body content : no extra text, formatting markers, separators, hyphens, or em dashes.Ensure the writing flows naturally like a real email, with strong comedic timing and progressively absurd observations.").content + '\n\n'
body += 'Regards, NIGGER\n\n'

msg = MIMEMultipart()
msg["From"] = EMAIL
msg["To"] = to_email
msg["Subject"] = subject

msg.attach(MIMEText(body, "plain"))


SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

try:
    server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
    server.starttls() 
    server.login(EMAIL, APP_PASSWORD)

    server.send_message(msg)

    print("✅ Email sent successfully!")

except Exception as e:
    print("❌ Error:", e)

finally:
    server.quit()