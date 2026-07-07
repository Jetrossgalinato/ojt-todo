<script setup lang="ts">
import { useForm } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import * as z from "zod"

const formSchema = toTypedSchema(
  z
    .object({
      name: z.string().min(1, "Full name is required"),
      email: z.string().email("Invalid email address"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    })
)

const { handleSubmit } = useForm({
  validationSchema: formSchema,
})

const onSubmit = handleSubmit((values) => {
  // handle registration here
  console.log(values)
})
</script>
<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-background px-4">
    <div class="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg">

      <!-- Header -->
      <div class="flex items-start justify-between mb-6">
        <div>
          <h1 class="text-lg font-semibold text-foreground">Create an account</h1>
          <p class="text-sm text-muted-foreground mt-1">
            Enter your details below to create your account
          </p>
        </div>
        <Button variant="link" type="button" class="text-sm shrink-0 px-0 h-auto">
          Login
        </Button>
      </div>

      <form class="flex flex-col gap-5" @submit="onSubmit">
        <!-- Full name -->
        <FormField v-slot="{ componentField }" name="name">
          <FormItem>
            <FormLabel>Full name</FormLabel>
            <FormControl>
              <Input type="text" placeholder="Ada Lovelace" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Email -->
        <FormField v-slot="{ componentField }" name="email">
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="m@example.com" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Password -->
        <FormField v-slot="{ componentField }" name="password">
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input type="password" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Confirm password -->
        <FormField v-slot="{ componentField }" name="confirmPassword">
          <FormItem>
            <FormLabel>Confirm password</FormLabel>
            <FormControl>
              <Input type="password" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Actions -->
        <div class="flex flex-col gap-2 mt-2">
          <Button type="submit" class="w-full">
            Create account
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>.

