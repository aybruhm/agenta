import {defineConfig} from "cypress"
import {config} from "dotenv"

// read in the environment variables from .env.local file
config({path: ".env.local"})

export default defineConfig({
    video: false,
    screenshotOnRunFailure: false,
    e2e: {
        baseUrl: "http://localhost",
        defaultCommandTimeout: 8000,
        requestTimeout: 8000,
        taskTimeout: 8000,
        execTimeout: 8000,
        pageLoadTimeout: 8000,
        responseTimeout: 8000,
        specPattern: ["*/e2e/smoke-tests.cy.ts", "*/e2e/testset.cy.ts"],
    },
    env: {
        baseApiURL: "http://localhost/api",
        OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        NEXT_PUBLIC_FF: false,
    },
})
