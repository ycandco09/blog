import type { Metadata } from "next";
import { getResume } from "@/lib/content";
import { PersonSchema } from "@/components/PersonSchema";
import { ResumeHeader } from "@/components/ResumeHeader";
import { SkillTags } from "@/components/SkillTags";
import { ExperienceTimeline } from "@/components/ExperienceTimeline";
import { ProjectCards } from "@/components/ProjectCards";
import { EducationTimeline } from "@/components/EducationTimeline";

export const metadata: Metadata = {
  title: "简历",
};

export default function ResumePage() {
  const resume = getResume();

  return (
    <>
      <PersonSchema resume={resume} />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <ResumeHeader resume={resume} />

        <div className="grid md:grid-cols-3 gap-8 mt-8">
          <div className="md:col-span-2 space-y-10">
            {resume.experience.length > 0 && (
              <ExperienceTimeline experiences={resume.experience} />
            )}
            {resume.projects.length > 0 && (
              <ProjectCards projects={resume.projects} />
            )}
            {(resume.education.length > 0 ||
              resume.certifications.length > 0) && (
              <EducationTimeline
                education={resume.education}
                certifications={resume.certifications}
              />
            )}
          </div>

          <aside className="space-y-8">
            {resume.skills.length > 0 && (
              <SkillTags skills={resume.skills} />
            )}
            {resume.pdf_resume && (
              <a
                href={resume.pdf_resume}
                download
                className="block w-full text-center px-4 py-3 rounded-lg
                  bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                📥 下载 PDF 简历
              </a>
            )}
          </aside>
        </div>
      </main>
    </>
  );
}
