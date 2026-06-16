import { z } from "zod";

export const BlogPostSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  description: z.string().min(1, "描述不能为空").max(200, "描述最多200字"),
  author: z.string().default("your-name"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式必须为 YYYY-MM-DD"),
  updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  tags: z.array(z.string()).default([]),
  category: z.string().min(1, "分类不能为空"),
  type: z.enum(["note", "writeup", "research"]).default("note"),
  slug: z.string().optional(),
  draft: z.boolean().default(false),
  difficulty: z.enum(["easy", "medium", "hard", "expert"]).default("medium"),
  competition: z.string().nullable().default(null),
  series: z.string().optional(),
  order: z.number().int().positive().optional(),
  cover: z.string().optional(),
  status: z.enum(["published", "updated"]).default("published"),
  featured: z.boolean().default(false),
});

export type BlogPost = z.infer<typeof BlogPostSchema>;

export const MaterialSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1).max(200),
  category: z.string().min(1),
  type: z.literal("material"),
  file_path: z.string().startsWith("/materials/"),
  size: z.string().regex(/^\d+(\.\d+)?(KB|MB|GB)$/),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tags: z.array(z.string()).default([]),
});

export type Material = z.infer<typeof MaterialSchema>;

const SkillGroupSchema = z.object({
  name: z.string(),
  items: z.array(z.string()),
});

const ExperienceSchema = z.object({
  role: z.string(),
  company: z.string().optional(),
  period: z.string(),
  description: z.string().optional(),
});

const ProjectSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  description: z.string().optional(),
  stars: z.number().int().nonnegative().optional(),
});

const EducationSchema = z.object({
  school: z.string(),
  degree: z.string(),
  period: z.string(),
});

const CertificationSchema = z.object({
  name: z.string(),
  issuer: z.string(),
  year: z.string(),
});

export const ResumeSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  email: z.string().email().optional(),
  github: z.string().optional(),
  blog: z.string().optional(),
  location: z.string().optional(),
  avatar: z.string().optional(),
  skills: z.array(SkillGroupSchema).default([]),
  experience: z.array(ExperienceSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  education: z.array(EducationSchema).default([]),
  certifications: z.array(CertificationSchema).default([]),
  pdf_resume: z.string().optional(),
});

export type Resume = z.infer<typeof ResumeSchema>;
