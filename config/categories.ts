export interface CategoryConfig {
  icon: string;
  description: string;
  color: string;
  order: number;
  showInNav: boolean;
}

export const categories: Record<string, CategoryConfig> = {
  Pwn: {
    icon: "💣",
    description: "二进制漏洞利用",
    color: "#e74c3c",
    order: 1,
    showInNav: true,
  },
  Web: {
    icon: "🌐",
    description: "Web安全",
    color: "#3498db",
    order: 2,
    showInNav: true,
  },
  Reverse: {
    icon: "🔍",
    description: "逆向工程",
    color: "#2ecc71",
    order: 3,
    showInNav: true,
  },
  Crypto: {
    icon: "🔐",
    description: "密码学",
    color: "#9b59b6",
    order: 4,
    showInNav: true,
  },
  Misc: {
    icon: "📦",
    description: "杂项",
    color: "#95a5a6",
    order: 5,
    showInNav: false,
  },
};
