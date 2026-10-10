import { prisma } from "@/lib/prisma";

/**
 * Creates a fully populated demo matter for onboarding (same narrative as prisma/seed.ts).
 */
export async function createExampleCaseForOrganization(
  organizationId: string,
): Promise<{ caseId: string; title: string }> {
  const existing = await prisma.case.findFirst({
    where: {
      organizationId,
      title: "Smith v. Acme Corp. (Example)",
    },
    select: { id: true, title: true },
  });

  if (existing) {
    return { caseId: existing.id, title: existing.title };
  }

  const demoCase = await prisma.case.create({
    data: {
      organizationId,
      title: "Smith v. Acme Corp. (Example)",
      courtType: "FEDERAL",
      jurisdiction: "federal-northern-district-ca",
      courtName: "U.S. District Court, Northern District of California",
      caseNumber: "3:24-cv-01234",
      plaintiff: "John Smith",
      defendant: "Acme Corporation",
      status: "FACTS",
      claims: {
        create: [
          {
            claimType: "negligence",
            jurisdiction: "federal-northern-district-ca",
            elements: [
              {
                element: "Duty of Care",
                description: "Defendant owed plaintiff a duty of reasonable care.",
                satisfied: true,
              },
              {
                element: "Breach of Duty",
                description: "Defendant breached that duty.",
                satisfied: true,
              },
              {
                element: "Causation",
                description: "Defendant's breach caused plaintiff's injury.",
                satisfied: false,
              },
              {
                element: "Damages",
                description: "Plaintiff suffered actual harm.",
                satisfied: true,
              },
            ],
          },
        ],
      },
      facts: {
        create: [
          {
            statement:
              "On January 15, 2024, defendant Acme Corp. operated a forklift in a crowded warehouse without proper safety barriers.",
            date: new Date("2024-01-15"),
            category: "INCIDENT",
            source: "Incident report",
          },
          {
            statement:
              "Plaintiff John Smith was lawfully present in the warehouse as a delivery driver.",
            date: new Date("2024-01-15"),
            category: "BACKGROUND",
            source: "Employment records",
          },
          {
            statement:
              "The forklift struck plaintiff, causing a fractured tibia and severe lacerations.",
            date: new Date("2024-01-15"),
            category: "INCIDENT",
            source: "Medical records",
          },
          {
            statement:
              "Defendant had received three prior safety violations from OSHA regarding forklift operations.",
            date: new Date("2023-12-01"),
            category: "BACKGROUND",
            source: "OSHA records",
          },
          {
            statement:
              "Plaintiff was unable to work for 6 months following the incident.",
            date: new Date("2024-07-15"),
            category: "DAMAGES",
            source: "Employment records",
          },
        ],
      },
      timeline: {
        create: [
          {
            date: new Date("2023-10-01"),
            title: "OSHA Inspection",
            description: "OSHA cited Acme Corp. for unsafe forklift operations.",
          },
          {
            date: new Date("2023-12-01"),
            title: "Second OSHA Violation",
            description: "Second safety violation issued.",
          },
          {
            date: new Date("2024-01-15"),
            title: "Incident Occurs",
            description: "Forklift strikes plaintiff in warehouse.",
          },
          {
            date: new Date("2024-01-15"),
            title: "Emergency Room Visit",
            description: "Plaintiff treated for fractured tibia.",
          },
          {
            date: new Date("2024-03-01"),
            title: "Surgery",
            description: "Plaintiff undergoes surgical repair of tibia.",
          },
          {
            date: new Date("2024-07-15"),
            title: "Return to Work",
            description: "Plaintiff returns to limited-duty work after 6 months.",
          },
        ],
      },
      witnesses: {
        create: [
          {
            name: "Maria Garcia",
            contact: "mgarcia@email.com",
            statement:
              "I saw the forklift driver speeding through the warehouse without honking.",
            credibility: "high",
          },
          {
            name: "Robert Chen",
            contact: "rchen@email.com",
            statement:
              "Acme never provided forklift safety training to temporary workers.",
            credibility: "high",
          },
          {
            name: "James Wilson",
            contact: "",
            statement: "I heard the crash from the next aisle.",
            credibility: "medium",
          },
        ],
      },
      damages: {
        create: [
          {
            category: "medical",
            amount: 85000,
            description: "Emergency room, surgery, and rehabilitation",
          },
          {
            category: "lost_wages",
            amount: 45000,
            description: "6 months of lost income",
          },
          {
            category: "future_medical",
            amount: 30000,
            description: "Estimated future medical costs",
          },
          {
            category: "pain_suffering",
            amount: 100000,
            description: "Physical pain and emotional distress",
          },
        ],
      },
      evidence: {
        create: [
          {
            title: "Incident Report",
            type: "DOCUMENT",
            fileName: "incident_report.pdf",
          },
          {
            title: "Medical Records",
            type: "DOCUMENT",
            fileName: "medical_records.pdf",
          },
          {
            title: "OSHA Violation Notices",
            type: "DOCUMENT",
            fileName: "osha_violations.pdf",
          },
          {
            title: "Warehouse Photos",
            type: "PHOTO",
            fileName: "warehouse_photos.jpg",
          },
        ],
      },
    },
    select: { id: true, title: true },
  });

  return { caseId: demoCase.id, title: demoCase.title };
}
