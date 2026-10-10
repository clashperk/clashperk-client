import { LegalDocument, type LegalSection } from "@/components/legal-document";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service | ClashPerk" };

const sections: LegalSection[] = [
  {
    section: "",
    description:
      "Welcome to ClashPerk! These terms of service ('Terms') govern your use of the ClashPerk Discord bot ('the Bot'). By using the Bot, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use the Bot.",
  },
  {
    section: "Use of the Bot",
    uses: [
      "You must comply with Discord's Terms of Service and Community Guidelines in addition to these Terms.",
      "You may use the Bot only for lawful purposes and in accordance with these Terms and any applicable laws and regulations.",
    ],
  },
  {
    section: "License",
    description:
      "ClashPerk grants you a non-exclusive, non-transferable, revocable license to use the Bot in Discord servers that you own or have the necessary permissions to add the Bot to.",
  },
  {
    section: "Prohibited Activities",
    description: "You agree not to:",
    uses: [
      "Engage in massive spamming, including but not limited to the repetitive posting of messages or commands that disrupt the normal functioning of the Bot or Discord servers.",
    ],
  },
  {
    section: "Changes to Terms",
    description:
      "ClashPerk reserves the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice before any new terms take effect.",
  },
  {
    section: "Termination",
    description:
      "ClashPerk may terminate or suspend your access to the Bot immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.",
  },
  {
    section: "Contact Us",
    description: "If you have any questions about these Terms, please contact us at",
    contact: true,
  },
  {
    section: "Agreement",
    description: "By using the ClashPerk Discord bot, you agree to these Terms.",
  },
];

export default function TermsPage() {
  return (
    <LegalDocument title="Terms of Service" lastUpdated="July 30, 2024" sections={sections} />
  );
}
