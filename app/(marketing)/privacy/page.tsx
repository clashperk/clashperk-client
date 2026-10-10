import { LegalDocument, type LegalSection } from "@/components/legal-document";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy | ClashPerk" };

const sections: LegalSection[] = [
  {
    section: "",
    description:
      "ClashPerk ('we', 'us', 'our') operates the ClashPerk Discord bot ('the Bot'). This Privacy Policy outlines how we collect, use, and disclose information from users ('you', 'your') of the Bot.",
  },
  {
    section: "Information We Collect",
    details: [
      {
        type: "User-Provided Information",
        description:
          "We may collect and store the information you provide when interacting with the Bot, such as Discord user IDs, server IDs, and Channel IDs.",
      },
      {
        type: "In-game Data",
        description:
          "We collect information through the Clash of Clans API, which includes your game performance and statistics.",
      },
      {
        type: "Automatically Collected Information",
        description:
          "We may collect certain information automatically, including usage details.",
      },
    ],
  },
  {
    section: "Use of Information",
    description: "We may use the information we collect to:",
    uses: [
      "Provide and maintain the Bot and its features",
      "Improve, personalize, and optimize the Bot",
      "Respond to your inquiries, support requests, and feedback",
      "Communicate with you about updates, news, and other information related to the Bot",
    ],
  },
  {
    section: "Disclosure of Information",
    description: "We may disclose your information:",
    uses: [
      "To comply with applicable laws, regulations, legal processes, or government requests",
      "To enforce our Terms of Service or protect our rights, property, or safety, or the rights, property, or safety of others",
    ],
  },
  {
    section: "Security",
    description:
      "We implement a variety of security measures to safeguard the information we collect. However, no method of transmission over the Internet or electronic storage is completely secure, so we cannot guarantee absolute security.",
  },
  {
    section: "User Rights",
    description:
      "You have the right to request the deletion of your personal information that we have collected and stored. To request the deletion of your data, please contact us.",
  },
  {
    section: "Changes to This Privacy Policy",
    description:
      "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.",
  },
  {
    section: "Contact Us",
    description: "If you have any questions about this Privacy Policy, please contact us at",
    contact: true,
  },
  {
    section: "Agreement",
    description:
      "By using the ClashPerk Discord bot, you agree to the terms of this Privacy Policy.",
  },
];

export default function PrivacyPage() {
  return <LegalDocument title="Privacy Policy" lastUpdated="July 30, 2024" sections={sections} />;
}
