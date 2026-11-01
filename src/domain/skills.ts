export interface SkillDefinition {
  name: string
  aliases: string[]
}

export const COMMON_SKILLS: SkillDefinition[] = [
  // Programming Languages
  { name: 'TypeScript', aliases: ['typescript', 'ts'] },
  { name: 'JavaScript', aliases: ['javascript', 'js', 'es6', 'es2020'] },
  { name: 'Python', aliases: ['python', 'python3', 'py'] },
  { name: 'Java', aliases: ['java', 'jdk'] },
  { name: 'C++', aliases: ['c++', 'cpp'] },
  { name: 'C#', aliases: ['c#', 'csharp', '.net'] },
  { name: 'Go', aliases: ['golang', 'go language'] },
  { name: 'Rust', aliases: ['rust'] },
  { name: 'SQL', aliases: ['sql', 't-sql', 'pl/sql', 'mysql', 'postgres', 'postgresql'] },
  { name: 'HTML5', aliases: ['html', 'html5'] },
  { name: 'CSS3', aliases: ['css', 'css3', 'scss', 'sass'] },
  { name: 'R', aliases: ['r language', 'r stats'] },
  { name: 'Scala', aliases: ['scala'] },
  { name: 'Kotlin', aliases: ['kotlin'] },
  { name: 'Swift', aliases: ['swift'] },
  { name: 'PHP', aliases: ['php'] },
  { name: 'Ruby', aliases: ['ruby', 'rails', 'ruby on rails'] },
  { name: 'Shell Scripting', aliases: ['bash', 'shell', 'zsh', 'powershell'] },

  // Web & Frontend
  { name: 'React', aliases: ['react', 'react.js', 'reactjs'] },
  { name: 'Next.js', aliases: ['nextjs', 'next.js'] },
  { name: 'Vue.js', aliases: ['vue', 'vue.js', 'vuejs'] },
  { name: 'Nuxt', aliases: ['nuxt', 'nuxtjs'] },
  { name: 'Angular', aliases: ['angular', 'angularjs'] },
  { name: 'Svelte', aliases: ['svelte', 'sveltekit'] },
  { name: 'Tailwind CSS', aliases: ['tailwind', 'tailwindcss'] },
  { name: 'Redux', aliases: ['redux', 'redux toolkit'] },
  { name: 'Zustand', aliases: ['zustand'] },
  { name: 'GraphQL', aliases: ['graphql', 'apollo'] },
  { name: 'REST APIs', aliases: ['rest', 'restful', 'rest api', 'rest apis'] },
  { name: 'Webpack', aliases: ['webpack'] },
  { name: 'Vite', aliases: ['vite', 'vitejs'] },

  // Backend & Architecture
  { name: 'Node.js', aliases: ['nodejs', 'node.js', 'node'] },
  { name: 'Express.js', aliases: ['express', 'express.js', 'expressjs'] },
  { name: 'NestJS', aliases: ['nestjs', 'nest.js'] },
  { name: 'FastAPI', aliases: ['fastapi'] },
  { name: 'Django', aliases: ['django'] },
  { name: 'Flask', aliases: ['flask'] },
  { name: 'Spring Boot', aliases: ['spring', 'spring boot', 'springboot'] },
  { name: 'Microservices', aliases: ['microservices', 'microservice'] },
  { name: 'gRPC', aliases: ['grpc'] },
  { name: 'Kafka', aliases: ['kafka', 'apache kafka'] },
  { name: 'RabbitMQ', aliases: ['rabbitmq'] },
  { name: 'Redis', aliases: ['redis'] },

  // Data & AI/ML
  { name: 'Machine Learning', aliases: ['machine learning', 'ml'] },
  { name: 'Deep Learning', aliases: ['deep learning', 'dl'] },
  { name: 'PyTorch', aliases: ['pytorch', 'torch'] },
  { name: 'TensorFlow', aliases: ['tensorflow', 'tf', 'keras'] },
  { name: 'Scikit-Learn', aliases: ['scikit-learn', 'sklearn'] },
  { name: 'Pandas', aliases: ['pandas'] },
  { name: 'NumPy', aliases: ['numpy'] },
  { name: 'Data Analysis', aliases: ['data analysis', 'exploratory data analysis', 'eda'] },
  { name: 'Data Visualization', aliases: ['data visualization', 'matplotlib', 'seaborn', 'plotly'] },
  { name: 'Power BI', aliases: ['power bi', 'powerbi'] },
  { name: 'Tableau', aliases: ['tableau'] },
  { name: 'Apache Spark', aliases: ['spark', 'pyspark', 'apache spark'] },
  { name: 'Hadoop', aliases: ['hadoop', 'hdfs'] },
  { name: 'NLP', aliases: ['nlp', 'natural language processing', 'llm', 'llms', 'transformers'] },
  { name: 'Computer Vision', aliases: ['computer vision', 'opencv', 'cv'] },
  { name: 'Data Engineering', aliases: ['data engineering', 'etl', 'elt', 'data pipelines'] },
  { name: 'dbt', aliases: ['dbt'] },
  { name: 'Snowflake', aliases: ['snowflake'] },
  { name: 'BigQuery', aliases: ['bigquery', 'google bigquery'] },

  // Databases & Cloud
  { name: 'PostgreSQL', aliases: ['postgresql', 'postgres'] },
  { name: 'MongoDB', aliases: ['mongodb', 'mongo'] },
  { name: 'MySQL', aliases: ['mysql'] },
  { name: 'SQLite', aliases: ['sqlite'] },
  { name: 'DynamoDB', aliases: ['dynamodb'] },
  { name: 'Firebase', aliases: ['firebase', 'firestore'] },
  { name: 'Supabase', aliases: ['supabase'] },
  { name: 'AWS', aliases: ['aws', 'amazon web services', 's3', 'ec2', 'lambda', 'cloudformation'] },
  { name: 'Azure', aliases: ['azure', 'microsoft azure'] },
  { name: 'GCP', aliases: ['gcp', 'google cloud', 'google cloud platform'] },
  { name: 'Docker', aliases: ['docker', 'containerization', 'containers'] },
  { name: 'Kubernetes', aliases: ['kubernetes', 'k8s'] },
  { name: 'CI/CD', aliases: ['ci/cd', 'github actions', 'gitlab ci', 'jenkins'] },
  { name: 'Terraform', aliases: ['terraform', 'iac'] },
  { name: 'Git', aliases: ['git', 'github', 'gitlab'] },
  { name: 'Linux', aliases: ['linux', 'unix', 'ubuntu', 'debian', 'centos'] },

  // Testing & Quality
  { name: 'Jest', aliases: ['jest'] },
  { name: 'Vitest', aliases: ['vitest'] },
  { name: 'Cypress', aliases: ['cypress'] },
  { name: 'Playwright', aliases: ['playwright'] },
  { name: 'Unit Testing', aliases: ['unit testing', 'unit test', 'tdd'] },

  // Methodologies
  { name: 'Agile', aliases: ['agile', 'scrum', 'kanban'] },
  { name: 'System Design', aliases: ['system design', 'software architecture'] },
]

export function suggestSkillsFromText(extractedText: string, limit = 12): string[] {
  if (!extractedText.trim()) return []

  const lower = extractedText.toLowerCase()
  const scores: { name: string; count: number }[] = []

  for (const skill of COMMON_SKILLS) {
    let count = 0
    for (const alias of skill.aliases) {
      const escaped = alias.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
      const regex = new RegExp(`(?:^|[^a-zA-Z0-9_])${escaped}(?:$|[^a-zA-Z0-9_])`, 'gi')
      const matches = lower.match(regex)
      if (matches) {
        count += matches.length
      }
    }
    if (count > 0) {
      scores.push({ name: skill.name, count })
    }
  }

  return scores
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((s) => s.name)
}

/**
 * Role category patterns mapping keywords to candidate roles
 */
export interface RoleProfileMatch {
  suggestedRole: string
  confidence: number
  matchedKeywords: string[]
}

const ROLE_DEFINITIONS: { role: string; keywords: string[]; shelfKeywords: string[] }[] = [
  {
    role: 'AI / ML Engineer',
    shelfKeywords: ['ai', 'ml', 'machine learning', 'artificial intelligence', 'deep learning'],
    keywords: [
      'machine learning', 'deep learning', 'pytorch', 'tensorflow', 'llm', 'llms',
      'transformers', 'nlp', 'computer vision', 'neural network', 'huggingface',
      'model training', 'keras', 'scikit-learn', 'data science',
    ],
  },
  {
    role: 'Data Analyst',
    shelfKeywords: ['data analyst', 'business analyst', 'analytics', 'bi'],
    keywords: [
      'data analysis', 'sql', 'tableau', 'power bi', 'excel', 'pandas',
      'dashboards', 'reporting', 'bi', 'business intelligence', 'eda', 'metrics',
      'kpi', 'statistics', 'exploratory data',
    ],
  },
  {
    role: 'Full-Stack Developer',
    shelfKeywords: ['full stack', 'fullstack', 'full-stack', 'web developer'],
    keywords: [
      'full stack', 'fullstack', 'react', 'node.js', 'typescript', 'javascript',
      'next.js', 'rest apis', 'graphql', 'html5', 'css3', 'tailwind', 'express',
    ],
  },
  {
    role: 'Python / Backend Developer',
    shelfKeywords: ['backend', 'python', 'server', 'api'],
    keywords: [
      'backend', 'python', 'django', 'fastapi', 'flask', 'microservices',
      'redis', 'kafka', 'postgres', 'postgresql', 'sql', 'docker', 'golang',
    ],
  },
  {
    role: 'Cloud / DevOps Engineer',
    shelfKeywords: ['devops', 'cloud', 'sre', 'infrastructure'],
    keywords: [
      'devops', 'kubernetes', 'k8s', 'docker', 'terraform', 'aws', 'gcp',
      'azure', 'ci/cd', 'helm', 'ansible', 'linux', 'cloudformation',
    ],
  },
]

/**
 * Reads resume text and classifies what role it represents with matching keywords
 */
export function inferRoleFromText(extractedText: string): RoleProfileMatch {
  if (!extractedText.trim()) {
    return {
      suggestedRole: 'General Developer',
      confidence: 0,
      matchedKeywords: [],
    }
  }

  const lower = extractedText.toLowerCase()
  let bestRole = 'General Candidate'
  let bestScore = 0
  let bestMatches: string[] = []

  for (const def of ROLE_DEFINITIONS) {
    const matched: string[] = []
    let score = 0

    for (const kw of def.keywords) {
      const escaped = kw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
      const regex = new RegExp(`(?:^|[^a-zA-Z0-9_])${escaped}(?:$|[^a-zA-Z0-9_])`, 'gi')
      const count = (lower.match(regex) || []).length
      if (count > 0) {
        matched.push(kw)
        score += count * (kw.length > 5 ? 2 : 1)
      }
    }

    if (score > bestScore) {
      bestScore = score
      bestRole = def.role
      bestMatches = matched
    }
  }

  const confidence = Math.min(Math.round((bestScore / 15) * 100), 100)

  return {
    suggestedRole: bestRole,
    confidence,
    matchedKeywords: bestMatches.slice(0, 8),
  }
}

/**
 * Finds the best existing shelf category that matches the detected role
 */
export function matchBestCategory(
  detectedRole: string,
  categories: { id: string; name: string }[]
): string | undefined {
  if (categories.length === 0) return undefined

  const roleDef = ROLE_DEFINITIONS.find((r) => r.role === detectedRole)
  const searchTerms = roleDef ? roleDef.shelfKeywords : [detectedRole.toLowerCase()]

  for (const cat of categories) {
    const catNameLower = cat.name.toLowerCase()
    for (const term of searchTerms) {
      if (catNameLower.includes(term.toLowerCase()) || term.toLowerCase().includes(catNameLower)) {
        return cat.id
      }
    }
  }

  return categories[0].id
}
