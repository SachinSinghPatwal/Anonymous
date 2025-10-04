"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { verifySchema } from "@/schemas/acceptMessageSchema";
import axios, { AxiosError } from "axios";
import { User } from "next-auth";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw } from "lucide-react";
import MessageCard from "@/components/MessageCard";
import { Message } from "@/models/User";
function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  };
  const { data: session } = useSession();
  const form = useForm({
    resolver: zodResolver(verifySchema),
  });
  const { register, watch, setValue } = form;
  const acceptMessages = watch("acceptMessages");

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get("/api/accept-messages");
      setValue("acceptMessages", response.data.isAcceptingMessages);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.message || "Something went wrong");
      }
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue]);

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setLoading(true);
      setIsSwitchLoading(false);
      try {
        const response = await axios.get("/api/get-messages");
        setMessages(response.data.messages || []);
        if (refresh) {
          toast.success("Messages refreshed");
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          toast.error(error.message || "Something went wrong");
        }
      } finally {
        setLoading(false);
        setIsSwitchLoading(false);
      }
    },
    [setLoading, setMessages]
  );

  // handle switch change
  const handleSwitchChange = async () => {
    try {
      const response = await axios.post("/api/accept-messages", {
        acceptMessages: !acceptMessages,
      });
      setValue("acceptMessages", !acceptMessages);
      toast.success(response.data.message);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  useEffect(() => {
    if (!session || !session.user) return;
    fetchAcceptMessages();
    fetchMessages();
  }, [fetchAcceptMessages, fetchMessages, session, setValue]);

  const { username } = session?.user as User;
  // do more research
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success("Profile URL copied to clipboard");
  };
  if (!session || !session.user) {
    return <div>Please sign in to access the dashboard</div>;
  }
  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Unique Link </h2>
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="border border-gray-300 rounded p-2 mr-2 flex-1"
          />
          <button
            onClick={copyToClipboard}
            className="bg-blue-500 text-white rounded p-2"
          >
            Copy
          </button>
        </div>
      </div>
      <div className="mb-4">
        <Switch
          {...register("acceptMessages")}
          checked={acceptMessages}
          onChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages{acceptMessages ? "On" : "Off"}
        </span>
      </div>
      <Separator />
      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {loading ? (
          <Loader2 className="animate-spin h-4 w-4" />
        ) : (
          <RefreshCcw className="h-4 w-4 " />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageCard
              key={index}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages found. Your messages will appear here.</p>
        )}
      </div>
    </div>
  );
}

export default Page;
