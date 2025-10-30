import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content, HtmlContent
from typing import Optional
import base64

class EmailService:
    def __init__(self):
        self.sendgrid_api_key = os.getenv("SENDGRID_API_KEY", "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")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@prompttrim.com")
        self.sg = SendGridAPIClient(api_key=self.sendgrid_api_key)
    
    async def send_welcome_email(self, user_email: str, user_name: str) -> bool:
        """Send welcome email to new user with JetBrains Mono font"""
        try:
            subject = "Welcome to PromptTrim - Your AI Prompt Optimization Platform"
            
            # HTML email template with JetBrains Mono font
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to PromptTrim</title>
                <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
                <style>
                    body {{
                        font-family: 'JetBrains Mono', monospace;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f8f9fa;
                    }}
                    .container {{
                        background: white;
                        border-radius: 8px;
                        padding: 40px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }}
                    .header {{
                        text-align: center;
                        margin-bottom: 30px;
                    }}
                    .logo {{
                        font-size: 24px;
                        font-weight: 600;
                        color: #2563eb;
                        margin-bottom: 10px;
                    }}
                    .subtitle {{
                        color: #6b7280;
                        font-size: 14px;
                    }}
                    .content {{
                        margin-bottom: 30px;
                    }}
                    .highlight {{
                        background: #f3f4f6;
                        padding: 15px;
                        border-radius: 6px;
                        border-left: 4px solid #2563eb;
                        margin: 20px 0;
                    }}
                    .code {{
                        background: #1f2937;
                        color: #f9fafb;
                        padding: 15px;
                        border-radius: 6px;
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 12px;
                        overflow-x: auto;
                        margin: 15px 0;
                    }}
                    .button {{
                        display: inline-block;
                        background: #2563eb;
                        color: white;
                        padding: 12px 24px;
                        text-decoration: none;
                        border-radius: 6px;
                        font-weight: 500;
                        margin: 20px 0;
                    }}
                    .footer {{
                        text-align: center;
                        color: #6b7280;
                        font-size: 12px;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #e5e7eb;
                    }}
                    .feature {{
                        margin: 15px 0;
                        padding: 10px 0;
                    }}
                    .feature-title {{
                        font-weight: 600;
                        color: #2563eb;
                        margin-bottom: 5px;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">PromptTrim</div>
                        <div class="subtitle">AI-Powered Prompt Optimization</div>
                    </div>
                    
                    <div class="content">
                        <h2>Welcome, {user_name}!</h2>
                        
                        <p>Thank you for joining PromptTrim, the cutting-edge platform that optimizes your AI prompts using advanced TinyLlama compression technology.</p>
                        
                        <div class="highlight">
                            <strong>What is PromptTrim?</strong><br>
                            PromptTrim reduces your prompt token count by up to 70% while maintaining the same output quality, helping you save costs and improve efficiency.
                        </div>
                        
                        <h3>Key Features:</h3>
                        <div class="feature">
                            <div class="feature-title">🚀 Smart Compression</div>
                            Uses TinyLlama to intelligently compress prompts while preserving meaning
                        </div>
                        
                        <div class="feature">
                            <div class="feature-title">💰 Cost Savings</div>
                            Reduce token usage by 30-70% without losing quality
                        </div>
                        
                        <div class="feature">
                            <div class="feature-title">🔧 Easy Integration</div>
                            Simple API integration with your existing tools
                        </div>
                        
                        <div class="feature">
                            <div class="feature-title">📊 Analytics</div>
                            Track your usage and savings with detailed analytics
                        </div>
                        
                        <h3>Getting Started:</h3>
                        <p>1. <strong>Get your API key:</strong> Log in to your dashboard to generate your unique API key</p>
                        <p>2. <strong>Integrate with your tools:</strong> Use our simple REST API to optimize prompts</p>
                        <p>3. <strong>Start saving:</strong> Watch your token usage decrease while maintaining quality</p>
                        
                        <div class="code">
# Example API call
curl -X POST "https://api.prompttrim.com/optimize" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{{"prompt": "Your long prompt here", "compression_ratio": 0.5}}'
                        </div>
                        
                        <div style="text-align: center;">
                            <a href="https://app.prompttrim.com/dashboard" class="button">Go to Dashboard</a>
                        </div>
                        
                        <p>Need help? Check out our <a href="https://docs.prompttrim.com">documentation</a> or contact our support team.</p>
                    </div>
                    
                    <div class="footer">
                        <p>This email was sent to {user_email}</p>
                        <p>© 2024 PromptTrim. All rights reserved.</p>
                        <p>You received this email because you signed up for PromptTrim.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Create email
            from_email = Email(self.from_email)
            to_email = To(user_email)
            content = HtmlContent(html_content)
            
            mail = Mail(
                from_email=from_email,
                to_emails=to_email,
                subject=subject,
                html_content=content
            )
            
            # Send email
            response = self.sg.send(mail)
            
            if response.status_code == 202:
                print(f"Welcome email sent successfully to {user_email}")
                return True
            else:
                print(f"Failed to send welcome email. Status code: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"Error sending welcome email: {e}")
            return False
    
    async def send_api_key_email(self, user_email: str, user_name: str, api_key: str) -> bool:
        """Send API key email to user"""
        try:
            subject = "Your PromptTrim API Key is Ready"
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Your API Key</title>
                <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
                <style>
                    body {{
                        font-family: 'JetBrains Mono', monospace;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f8f9fa;
                    }}
                    .container {{
                        background: white;
                        border-radius: 8px;
                        padding: 40px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }}
                    .api-key {{
                        background: #1f2937;
                        color: #f9fafb;
                        padding: 20px;
                        border-radius: 6px;
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 14px;
                        word-break: break-all;
                        margin: 20px 0;
                        border: 2px solid #374151;
                    }}
                    .warning {{
                        background: #fef3c7;
                        border: 1px solid #f59e0b;
                        color: #92400e;
                        padding: 15px;
                        border-radius: 6px;
                        margin: 20px 0;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Your API Key is Ready!</h2>
                    <p>Hi {user_name},</p>
                    <p>Your PromptTrim API key has been generated successfully. Keep this key secure and don't share it with others.</p>
                    
                    <div class="api-key">
                        {api_key}
                    </div>
                    
                    <div class="warning">
                        <strong>⚠️ Important:</strong> This API key provides access to your PromptTrim account. Keep it secure and never share it publicly.
                    </div>
                    
                    <p>You can now start using the PromptTrim API to optimize your prompts. Check out our <a href="https://docs.prompttrim.com">documentation</a> for integration examples.</p>
                </div>
            </body>
            </html>
            """
            
            from_email = Email(self.from_email)
            to_email = To(user_email)
            content = HtmlContent(html_content)
            
            mail = Mail(
                from_email=from_email,
                to_emails=to_email,
                subject=subject,
                html_content=content
            )
            
            response = self.sg.send(mail)
            return response.status_code == 202
            
        except Exception as e:
            print(f"Error sending API key email: {e}")
            return False
