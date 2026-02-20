import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Img,
} from 'https://esm.sh/@react-email/components@0.0.22'
import * as React from 'https://esm.sh/react@18.3.1'

interface MagicLinkEmailProps {
  magicLink: string
  token?: string
}

export const MagicLinkEmail = ({
  magicLink,
  token,
}: MagicLinkEmailProps) => (
  <Html>
    <Head />
    <Preview>Your ZiggySitters login link</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoContainer}>
          <Img
            src="https://www.ziggysitters.com/logo-light.png"
            width="200"
            height="auto"
            alt="ZiggySitters"
            style={logo}
          />
        </Section>
        <Heading style={h1}>Sign in to ZiggySitters</Heading>
        <Text style={text}>
          Click the button below to securely sign in to your ZiggySitters account:
        </Text>
        <Section style={buttonContainer}>
          <Link
            href={magicLink}
            target="_blank"
            style={button}
          >
            Sign In to ZiggySitters
          </Link>
        </Section>
        {token && (
          <>
            <Text style={text}>
              Or enter this verification code:
            </Text>
            <Section style={codeContainer}>
              <Text style={code}>{token}</Text>
            </Section>
          </>
        )}
        <Text style={text}>
          Or copy and paste this link into your browser:
        </Text>
        <Text style={link}>{magicLink}</Text>
        <Text style={footerText}>
          This link will expire in 1 hour. If you didn't request this login link, you can safely ignore this email.
        </Text>
        <Section style={footer}>
          <Text style={footerCopy}>
            © 2025 ZiggySitters. All rights reserved.
          </Text>
          <Text style={footerCopy}>
            Connecting pet owners with trusted sitters
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const logoContainer = {
  textAlign: 'center' as const,
  padding: '30px 0',
}

const logo = {
  margin: '0 auto',
}

const h1 = {
  color: '#1a202c',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0 40px',
  textAlign: 'center' as const,
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
  margin: '16px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  padding: '20px 40px',
}

const button = {
  backgroundColor: '#1a9bd7',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 40px',
}

const codeContainer = {
  textAlign: 'center' as const,
  padding: '10px 40px',
}

const code = {
  display: 'inline-block',
  padding: '16px 32px',
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  fontSize: '32px',
  fontWeight: 'bold',
  letterSpacing: '4px',
  color: '#1a202c',
  fontFamily: 'monospace',
}

const link = {
  color: '#1a9bd7',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
  padding: '0 40px',
  margin: '8px 0',
}

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '22px',
  padding: '0 40px',
  marginTop: '32px',
}

const footer = {
  borderTop: '1px solid #e5e7eb',
  marginTop: '32px',
  paddingTop: '20px',
}

const footerCopy = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '20px',
  textAlign: 'center' as const,
  margin: '4px 0',
}
