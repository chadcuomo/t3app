import { useState } from "react";
import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";

const Form = () => {
  const { data: session } = useSession()
  const [message, setMessage] = useState("");
  const utils = trpc.useContext()
  const postMessage = trpc.guestbook.postMessage.useMutation({
    onMutate: () => {
      utils.guestbook.getAll.cancel();
      const optimisticUpdate = utils.guestbook.getAll.getData();

      if (optimisticUpdate) {
        utils.guestbook.getAll.setData(optimisticUpdate, optimisticUpdate);
      }
    },
    onSettled: () => {
      utils.guestbook.getAll.invalidate();
    },
  });

  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        postMessage.mutate({
          name: session?.user?.name as string,
          message,
        });
        setMessage("");
      }}
      >
        <input
          type="text"
          value={message}
          placeholder="Your message..."
          minLength={2}
          maxLength={100}
          onChange={(event) => setMessage(event.target.value)}
          className="px-4 py-2 rounded-md border-2 border-zinc-800 bg-neutral-900 focus:outline-none"
        />
        <button
          type="submit"
          className="p-2 rounded-md border-2 border-zinc-800 focus:outline-none"
        >
          Submit
        </button>
      </form>
  )
}

const Messages = () => {
  const { data: messages, isLoading } = trpc.guestbook.getAll.useQuery();

  if (isLoading) return <div>Fetching mesages...</div>;

  return (
    <div className="flex flex-col gap-4">
      {messages?.map((msg, index) => {
        return (
          <div key={index}>
            <p>{msg.message}</p>
            <span> -{msg.name}</span>
          </div>
        )
      })}
    </div>
  )
}

const Home: NextPage = () => {
  // useSession hook to get session data and status
  const { data: session, status } = useSession()
  if (status === "loading") {
    return <main>Loading...</main>;
  }

  return (
    <main className="flex flex-col items-center">
      <h1 className="text-3xl pt-4">Guestbook</h1>
      <p>
        Learning <code>create-t3-app</code>
      </p>
      <div className="pt-10">
        {session ? (
          <>
            <p> hi {session.user?.name}</p>
            <button onClick={() => signOut()}>
              Logout
            </button>
            <div className="pt-6">
              <Form />
            </div>
          </>
        ) : (
          <button onClick={() => signIn("discord")}>
            Login with Dscord
          </button>
        )}
        <div className="pt-10">
          <Messages />
        </div>
      </div>
    </main>
  );
};

export default Home;


