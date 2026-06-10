# 简历模块实现方案 + 代码解析

## 一、模块概览

简历页是个人能力展示的核心页面，使用单文件 `content/resume.md` 驱动内容，包含 5 个视觉区块：

| 区块 | 内容 |
|------|------|
| 个人信息区 | 头像、姓名、title、联系方式、社交链接 |
| 技能标签区 | 技能分组 + 标签云 |
| 工作经历区 | 时间线展示 |
| 项目作品区 | 项目卡片（含 GitHub 信息） |
| 教育/证书区 | 学历 + 认证时间线 |

---

## 二、页面组件

```tsx
// app/resume/page.tsx

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
            <ExperienceTimeline experiences={resume.experience} />
            <ProjectCards projects={resume.projects} />
            <EducationTimeline
              education={resume.education}
              certifications={resume.certifications}
            />
          </div>

          <aside className="space-y-8">
            <SkillTags skills={resume.skills} />
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
```

---

## 三、子组件

### 3.1 ResumeHeader —— 个人信息

```tsx
// components/ResumeHeader.tsx

import Image from "next/image";
import type { Resume } from "@/lib/schema";

export function ResumeHeader({ resume }: { resume: Resume }) {
  return (
    <header className="flex flex-col sm:flex-row items-start gap-6 pb-8 border-b">
      {resume.avatar && (
        <Image
          src={resume.avatar}
          alt={resume.name}
          width={96}
          height={96}
          className="rounded-full"
          priority
        />
      )}

      <div>
        <h1 className="text-3xl font-bold mb-1">{resume.name}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-3">
          {resume.title}
        </p>
        {resume.location && (
          <p className="text-sm text-gray-500 mb-2">📍 {resume.location}</p>
        )}

        <div className="flex flex-wrap gap-4 mt-3 text-sm">
          {resume.email && (
            <a href={`mailto:${resume.email}`}
              className="text-blue-600 dark:text-blue-400 hover:underline">
              ✉️ {resume.email}
            </a>
          )}
          {resume.github && (
            <a href={`https://${resume.github}`}
              target="_blank" rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline">
              🐙 {resume.github}
            </a>
          )}
          {resume.blog && (
            <a href={`https://${resume.blog}`}
              target="_blank" rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline">
              🌐 {resume.blog}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
```

### 3.2 SkillTags —— 技能标签

```tsx
// components/SkillTags.tsx

export function SkillTags({ skills }: { skills: Resume["skills"] }) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">🛠 技能</h2>
      {skills.map((group) => (
        <div key={group.name} className="mb-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            {group.name}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {group.items.map((item) => (
              <span
                key={item}
                className="px-2.5 py-1 text-xs rounded-full
                  bg-gray-100 dark:bg-gray-800
                  text-gray-700 dark:text-gray-300
                  border border-gray-200 dark:border-gray-700"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
```

### 3.3 ExperienceTimeline —— 时间线

```tsx
// components/ExperienceTimeline.tsx

export function ExperienceTimeline({
  experiences,
}: {
  experiences: Resume["experience"];
}) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">💼 工作经历</h2>
      <div className="relative border-l-2 border-gray-200 dark:border-gray-700 pl-6 space-y-8">
        {experiences.map((exp, i) => (
          <div key={i} className="relative">
            <div className="absolute -left-[31px] w-4 h-4 rounded-full
              bg-blue-600 border-2 border-white dark:border-[#0a0c10]" />

            <h3 className="text-lg font-semibold">{exp.role}</h3>
            <p className="text-blue-600 dark:text-blue-400 font-medium">
              {exp.company}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {exp.period}
            </p>
            {exp.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {exp.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
```

### 3.4 ProjectCards —— 项目卡片

```tsx
// components/ProjectCards.tsx

export function ProjectCards({
  projects,
}: {
  projects: Resume["projects"];
}) {
  if (projects.length === 0) return null;

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">🚀 项目作品</h2>
      <div className="grid gap-4">
        {projects.map((project) => (
          <a
            key={project.url}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-5 rounded-lg border border-gray-200 dark:border-gray-800
              hover:border-blue-500 transition-colors"
            style={{ borderRadius: "8px" }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold hover:text-blue-600 transition-colors">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {project.description}
                  </p>
                )}
              </div>
              {project.stars !== undefined && (
                <span className="flex items-center gap-1 text-sm text-gray-500 flex-shrink-0">
                  ⭐ {project.stars}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
```

### 3.5 EducationTimeline —— 教育/证书

```tsx
// components/EducationTimeline.tsx

export function EducationTimeline({
  education,
  certifications,
}: {
  education: Resume["education"];
  certifications: Resume["certifications"];
}) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">🎓 教育 & 证书</h2>
      <div className="relative border-l-2 border-gray-200 dark:border-gray-700 pl-6 space-y-6">
        {education.map((edu, i) => (
          <div key={i} className="relative">
            <div className="absolute -left-[31px] w-4 h-4 rounded-full
              bg-green-600 border-2 border-white dark:border-[#0a0c10]" />
            <h3 className="text-lg font-semibold">{edu.school}</h3>
            <p className="text-gray-600 dark:text-gray-400">{edu.degree}</p>
            <p className="text-sm text-gray-500 mt-1">{edu.period}</p>
          </div>
        ))}
      </div>

      {certifications.length > 0 && (
        <div className="mt-6 space-y-2">
          {certifications.map((cert, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2 rounded-lg
                bg-gray-50 dark:bg-gray-900"
            >
              <span className="font-medium">{cert.name}</span>
              <span className="text-sm text-gray-500">by {cert.issuer}</span>
              <span className="text-sm text-gray-400 ml-auto">{cert.year}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
```

---

## 四、Person Schema

```tsx
// components/PersonSchema.tsx

import type { Resume } from "@/lib/schema";

export function PersonSchema({ resume }: { resume: Resume }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: resume.name,
    jobTitle: resume.title,
    email: resume.email,
    url: `https://your-domain.com/resume`,
    sameAs: [
      resume.github ? `https://${resume.github}` : null,
      resume.blog ? `https://${resume.blog}` : null,
    ].filter(Boolean),
    ...(resume.location
      ? { address: { "@type": "PostalAddress", addressLocality: resume.location } }
      : {}),
    knowsAbout: resume.skills.flatMap((g) => g.items),
    worksFor: resume.experience.length > 0
      ? resume.experience.map((exp) => ({
          "@type": "Organization",
          name: exp.company,
        }))
      : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

---

## 五、代码解析

### 5.1 getResume 函数

```typescript
// lib/content.ts

export function getResume(): Resume {
  const filePath = path.join(process.cwd(), "content", "resume.md");
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(fileContent);

  const parsed = ResumeSchema.safeParse(data);

  if (!parsed.success) {
    console.warn("[resume] 简历数据校验失败：");
    console.warn(parsed.error.format());
    return ResumeSchema.parse({ name: "待填写", title: "" });
  }

  return parsed.data;
}
```

---

## 六、关键文件清单

| 文件路径 | 功能 |
|---------|------|
| `app/resume/page.tsx` | 简历页主组件 |
| `components/ResumeHeader.tsx` | 个人信息头部 |
| `components/SkillTags.tsx` | 技能标签云 |
| `components/ExperienceTimeline.tsx` | 工作经历时间线 |
| `components/ProjectCards.tsx` | 项目卡片列表 |
| `components/EducationTimeline.tsx` | 教育/证书时间线 |
| `components/PersonSchema.tsx` | Person JSON-LD Schema |
| `content/resume.md` | 简历内容（Markdown + YAML） |
