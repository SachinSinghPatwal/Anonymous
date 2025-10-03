"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { AxiosError } from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import NormalizeError from "@/helpers/normalizeError";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signInSchema } from "@/schemas/signInSchema";
import { signIn } from "next-auth/react";

function Page() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        identifier: data.Identifier,
        password: data.password,
      });
      if (result?.error) {
        toast.error(result.error);
      }
      if (result?.url) {
        router.replace("/dashboard");
      }
    } catch (error) {
      const axiosError: any = error as AxiosError;
      const errorMessage = axiosError.response?.data.message as string;
      toast.error(
        errorMessage || "There was an error signing up. Please try again."
      );
      NormalizeError("Error signing up", axiosError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-24">
      <h1 className="text-3xl font-bold mb-8">Sign-In account</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="Identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email/Username</FormLabel>
                <FormControl>
                  <Input placeholder="Email/Username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              "Sing-In"
            )}
          </Button>
          <div className="text-center mt-4">
            <p>
              Does not have an Account?{" "}
              <Link
                href="/signUp"
                className="text-blue-600 hover:text-blue-800"
              >
                Sign-up
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default Page;
