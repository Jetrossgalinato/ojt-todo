<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod"
import * as z from "zod"

const formSchema = toTypedSchema(
  z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
)

function onSubmit(values: Record<string, any>) {
  console.log("Register submitted:", values)
  navigateTo("/login")
}
</script>

<template>
  <Form :validation-schema="formSchema" @submit="onSubmit" class="flex flex-col gap-6">
    <FormField v-slot="{ componentField }" name="fullName">
      <FormItem>
        <Label for="fullName">Full Name</Label>
        <FormControl>
          <Input
            id="fullName"
            type="text"
            placeholder="Juan Dela Cruz"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

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
        <Label for="password">Password</Label>
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

    <FormField v-slot="{ componentField }" name="confirmPassword">
      <FormItem>
        <Label for="confirmPassword">Confirm Password</Label>
        <FormControl>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <Button type="submit" class="w-full">
      Sign up
    </Button>

    <p class="text-center text-sm text-muted-foreground">
      Already have an account?
      <NuxtLink to="/login" class="font-medium text-foreground underline underline-offset-4">
        Sign in
      </NuxtLink>
    </p>
  </Form>
</template>