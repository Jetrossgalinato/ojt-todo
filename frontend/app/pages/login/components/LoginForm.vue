<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod"
import * as z from "zod"

const formSchema = toTypedSchema(
  z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  })
)

function onSubmit(values: Record<string, any>) {
  console.log("Login submitted:", values)
  navigateTo("/dashboard")
}
</script>

<template>
  <Form :validation-schema="formSchema" @submit="onSubmit" class="flex flex-col gap-6">
    <FormField v-slot="{ componentField }" name="email">
      <FormItem>
        <Label for="email">Email</Label>
        <FormControl>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="password">
      <FormItem>
        <div class="flex items-center justify-between">
          <Label for="password">Password</Label>
          <NuxtLink
            to="/forgot-password"
            class="text-sm text-muted-foreground hover:text-foreground"
          >
            Forgot your password?
          </NuxtLink>
        </div>
        <FormControl>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <Button type="submit" class="w-full">
      Sign in
    </Button>

    <p class="text-center text-sm text-muted-foreground">
      Don't have an account?
      <NuxtLink to="/register" class="font-medium text-foreground underline underline-offset-4">
        Sign up
      </NuxtLink>
    </p>
  </Form>
</template>