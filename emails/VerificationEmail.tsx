import {
  Html,
  Head,
  Font,
  Preview,
  Row,
  Heading,
  Section,
  Text,
  Button,
} from "@react-email/components";

interface VerificationEmailProps {
  username: string;
  otp: string;
}

export default function VerificationEmail({
  username,
  otp,
}: VerificationEmailProps) {
  return (
    <Html>
      <Head>
        <title>Verify your email</title>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Preview>Verify your email</Preview>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Preview>Here&apos;s your verification code : {otp}</Preview>
      <Section>
        <Row>
          <Heading as="h2">Hello {username},</Heading>
        </Row>
        <Row>
          <Text>
            Thank you for registering!. Please use the following verification
            code to complete your registration:{" "}
          </Text>
        </Row>
        <Row>
          <Text>{otp}</Text>
        </Row>
        <Row>
          <Text>This code will expire in 10 minutes.</Text>
        </Row>
        <Row>
          <Text>
            {" "}
            If you did not request this code, please ignore this email.
          </Text>
        </Row>
        <Row>
          <Button href={`http://localhost:3000/verify/${username}`}>
            Verify here
          </Button>
        </Row>
      </Section>
    </Html>
  );
}
