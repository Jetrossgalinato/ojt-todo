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

const errorMessage = ref<string | null>(null)

async function onSubmit(values: Record<string, any>) {
  errorMessage.value = null

  try {
    const response = await $fetch("http://localhost:4000/auth/register", {
      method: "POST",
      body: {
        name: values.fullName,
        email: values.email,
        password: values.password,
      },
    })

    console.log("Registration successful:", response)
    await navigateTo("/login")
  } catch (error: any) {
    errorMessage.value = error?.data?.message || "Registration failed"
    console.error("Registration error:", error)
  }
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

    <div v-if="errorMessage" class="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
      {{ errorMessage }}
    </div>

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