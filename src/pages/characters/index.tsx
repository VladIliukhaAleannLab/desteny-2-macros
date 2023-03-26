import styles from "@/styles/Home.module.css";
import Link from "next/link";
import { useQuery } from "react-query";
import axios from "axios";
import {withAuthSsr} from "@/lib/session";

function useCharacters() {
  return useQuery<any>({
    queryKey: ["characters"],
    queryFn: async () => {
      const { data } = await axios.get("/api/characters");
      return data;
    },
  });
}
export default function Characters() {
  const { data } = useCharacters();

  return (
    <>
      <main className={styles.main}>
        <div>
          {data?.characters?.map((character: any, index: number) => {
            return (
              <Link href={`/characters/${character.characterId}`} key={index}>
                <div>characterId</div>
                <div>{character.characterId}</div>
                <div>dateLastPlayed</div>
                <div>{character.dateLastPlayed}</div>
                <br />
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}

export const getServerSideProps = withAuthSsr(() => ({
  props: {}
}));
