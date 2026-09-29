import type { LegalSection } from "@/components/legal"
import { config } from "@/config"

export const termsSections: LegalSection[] = [
  {
    heading: "Agreement",
    body: [
      `These terms are a contract between you and ${config.site.legal.entity}, which operates ${config.site.name}. By creating an account or using the service you accept them. If you are accepting on behalf of a company, you confirm you may bind it.`,
      "If you do not accept these terms, do not use the service.",
    ],
  },
  {
    heading: "What Hosto is",
    body: [
      `${config.site.name} is availability software. It records who is staying at an estate and when, enforces the turnover window an owner has configured, and controls who may see the identity of a reserver.`,
      "Hosto is not a party to any stay, not a booking agent, not a letting agent, and not a payment processor. Any agreement about a stay is between the estate owner and the guest. We do not hold deposits or move money.",
    ],
  },
  {
    heading: "Accounts",
    items: [
      "You must be at least 18 and able to enter a binding contract.",
      "The information on your account must be accurate and kept current.",
      "You are responsible for everything done under your account and for keeping your credentials safe. Tell us promptly if you suspect unauthorised access.",
      "One person, one account. Do not share logins.",
    ],
  },
  {
    heading: "Estate owners",
    body: [
      "If you list a property, you confirm you have the right to let it, and that your description, address, photographs, capacity and rates are accurate.",
      "You are solely responsible for complying with the law where the estate sits: registration and licensing, safety obligations, tax, and any local limit on short-term letting. Hosto does not check any of this for you.",
    ],
  },
  {
    heading: "Turnover buffers and availability",
    body: [
      "The turnover buffer is a number of minutes you choose. Hosto will refuse any reservation whose window overlaps an existing one, including that buffer, and will do so at the database level so two simultaneous attempts cannot both succeed.",
      "We do not judge whether the buffer you chose is long enough for cleaning, maintenance, safety, or any legal requirement. Choosing it is your decision and your responsibility.",
      "A reservation's buffer is fixed at the moment it is made. Changing a property's buffer afterwards affects future reservations only.",
    ],
  },
  {
    heading: "Reserver privacy",
    body: [
      "Each property has a setting controlling whether the identity of a reserver is shown publicly. As an owner, you decide it, and you are responsible for having a lawful basis to reveal a guest's identity before you switch it on.",
      "When the setting is off, we withhold identifying information on the server. That protection covers what Hosto sends; it cannot cover what you choose to publish elsewhere.",
    ],
  },
  {
    heading: "Pricing and currency",
    body: [
      "Pricing is optional for each property. Where it is enabled, a nightly rate is required, and a reservation records the total agreed at the time it was made. Amounts default to Indian Rupees.",
      "Prices displayed by Hosto are those entered by the estate owner. We do not verify them, collect them, or settle them.",
    ],
  },
  {
    heading: "Your content",
    body: [
      "You keep ownership of the descriptions, photographs and other material you upload. You grant us a non-exclusive, worldwide licence to host, store, reproduce and display that material for the sole purpose of operating the service.",
      "You confirm you own that material or have permission to use it, and that it does not infringe anyone's rights.",
    ],
  },
  {
    heading: "Acceptable use",
    items: [
      "Do not use Hosto for anything unlawful, deceptive, or harmful.",
      "Do not upload malware, attempt to breach our security, or probe the service for vulnerabilities without written permission.",
      "Do not scrape, mine, or bulk-extract data, particularly reserver information you have not been shown deliberately.",
      "Do not attempt to identify a reserver whose identity an owner has chosen to withhold.",
      "Do not interfere with the service's availability for other users.",
    ],
  },
  {
    heading: "Suspension and termination",
    body: [
      "You may close your account at any time. We may suspend or terminate access if you breach these terms, if we are required to by law, or if your use puts the service or other users at risk. Where it is reasonable to do so, we will warn you first.",
      "On termination, the licence above ends and we will delete or return your data in line with the Privacy Policy.",
    ],
  },
  {
    heading: "Disclaimers",
    body: [
      "The service is provided as it is. We do not warrant that it will be uninterrupted, error-free, or that it will meet any particular requirement. To the fullest extent the law allows, we exclude all implied warranties.",
      "Nothing in these terms limits liability for death or personal injury caused by negligence, for fraud, or for anything else that cannot lawfully be limited.",
    ],
  },
  {
    heading: "Limitation of liability",
    body: [
      "Subject to the paragraph above, neither party is liable for indirect or consequential loss, loss of profit, loss of business, or loss of anticipated savings.",
      "Our total liability arising out of or in connection with these terms is limited to the greater of the amount you paid us in the twelve months before the claim, or five thousand Indian Rupees.",
    ],
  },
  {
    heading: "Indemnity",
    body: [
      "You agree to indemnify us against claims brought by a third party arising from your content, your use of the service, your breach of these terms, or your failure to comply with the law applicable to letting your estate.",
    ],
  },
  {
    heading: "Governing law",
    body: [
      `These terms are governed by the laws of India, and the courts of ${config.site.legal.jurisdiction} have exclusive jurisdiction over any dispute arising from them.`,
    ],
  },
  {
    heading: "Changes",
    body: [
      "We may update these terms. If a change is material we will update the effective date and notify you before it takes effect. Continuing to use the service after that point means you accept the revised terms.",
    ],
  },
  {
    heading: "Contact",
    body: [
      `Write to ${config.site.contact.email}, or to ${config.site.contact.postal}.`,
    ],
  },
]
