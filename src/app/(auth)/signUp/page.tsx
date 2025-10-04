"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { singUpSchema } from "@/schemas/signUpSchema";
import NormalizeError from "@/helpers/normalizeError";
import { ApiResponse } from "@/types/ApiResponse";
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
function Page() {
  const [username, setUsername] = useState("");
  const [userNameMessage, setUserNameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debounced = useDebounceCallback(setUsername, 600);
  const router = useRouter();

  const form = useForm<z.infer<typeof singUpSchema>>({
    resolver: zodResolver(singUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });
  useEffect(() => {
    const checkUsernameUniqueness = async () => {
      setIsCheckingUsername(true);
      setUserNameMessage("");
      try {
        // const response = await axios.get("/api/check-username", {
        //   params: { username },
        // });
        const response = await axios.get(
          `/api/check-username-unique?username=${username}`
        );
        //   params: { username: username },
        // });
        setUserNameMessage(response.data.message);
      } catch (error) {
        const axiosError: AxiosError = error as AxiosError;
        setUserNameMessage(
          (axiosError.response?.data.message as string) ??
            "Error checking username"
        );
        NormalizeError("Error checking username", axiosError);
      } finally {
        setIsCheckingUsername(false);
      }
    };
    checkUsernameUniqueness();
  }, [username]);

  const onSubmit = async (data: z.infer<typeof singUpSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>("/api/signUp", data);
      toast.success(response.data.message);
      router.replace(`/verify/${username}`);
      setIsSubmitting(false);
    } catch (error) {
      const axiosError: any = error as AxiosError;
      const errorMessage = axiosError.response?.data.message as string;
      toast.error(
        errorMessage || "There was an error signing up. Please try again."
      );
      NormalizeError("Error signing up", axiosError);
    }
  };

  return (
    <div className="max-w-md mx-auto py-24">
      <h1 className="text-3xl font-bold mb-8">Create an account</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      field.onChange(e);
                      debounced(e.target.value);
                    }}
                  />
                </FormControl>
                {isCheckingUsername && <Loader2 className="animate-spin" />}
                <p
                  className={` text-sm ${userNameMessage === "username is unique" ? "text-green-500" : "text-red-500"}`}
                >
                  test {userNameMessage}
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email" {...field} />
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
              "Sing-up"
            )}
          </Button>
          <div className="text-center mt-4">
            <p>
              Already a member?{" "}
              <Link
                href="/signIn"
                className="text-blue-600 hover:text-blue-800"
              >
                Sign-in
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default Page;
