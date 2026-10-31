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
      // Word boundary match
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

  // Rank by frequency descending, then take top `limit`
  return scores
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((s) => s.name)
}
