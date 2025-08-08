export const typeDefs = /* GraphQL */ `
  scalar JSON

  type Profile { user_id: ID!, display_name: String, handle: String, role: String }
  type Plan { id: ID!, name: String!, price_cents: Int!, currency: String!, billing_interval: String!, features: JSON }
  type Course { id: ID!, slug: String!, title: String!, level: String, tags: [String!]!, version: Int!, published_at: String }

  type Query {
    me: Profile
    plans: [Plan!]!
    courses(tag: String, level: String, q: String): [Course!]!
  }

  input SubmitInput { exercise_id: ID!, code: String! }
  type SubmitResult { passed: Boolean!, score: Int!, stdout: String, stderr: String }

  type Mutation {
    submitExercise(input: SubmitInput!): SubmitResult!
  }
`;
