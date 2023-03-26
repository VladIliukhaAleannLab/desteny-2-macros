import styles from "@/styles/Home.module.css";
import { useMutation, useQuery } from "react-query";
import axios from "axios";
import { useRouter } from "next/router";
import {withAuthSsr} from "@/lib/session";

function useCharacter(characterId: string) {
  return useQuery<any>({
    queryKey: [`character/${characterId}`],
    queryFn: async () => {
      const { data } = await axios.get(`/api/characters/${characterId}`);
      return data;
    },
  });
}

function useLoadout() {
  return useMutation({
    mutationKey: ["characters"],
    mutationFn: async ({
      characterId,
      loadoutIndex,
    }: {
      characterId: string;
      loadoutIndex: string | number;
    }) => {
      const { data } = await axios.post(
        `/api/characters/${characterId}/equipLoadout/${loadoutIndex}`
      );
      return data;
    },
  });
}
export default function Character() {
  const router = useRouter();

  const characterId = router.query.characterId as string | undefined;

  if (!characterId) {
    return null;
  }
  return (
    <>
      <main className={styles.main}>
        <Component characterId={characterId} />
      </main>
    </>
  );
}

const Component = ({ characterId }: { characterId: string }) => {
  const { mutate } = useLoadout();

  const handleClick = async (loadoutIndex: number) => {
    mutate({
      characterId,
      loadoutIndex,
    });
  };

  return (
    <div>
      <div>Loadouts</div>
      <div className={styles.loadouts}>
        {new Array(6).fill(null).map((_, index) => {
          return (
            <Loadout
              onClick={() => handleClick(index)}
              key={index}
              index={index}
            />
          );
        })}
      </div>
    </div>
  );
};

const Loadout = ({
  index,
  onClick,
}: {
  onClick: VoidFunction;
  index: number;
}) => {
  return (
    <div className={styles.loadout} onClick={onClick}>
      {index}
      <br />
    </div>
  );
};

export const getServerSideProps = withAuthSsr(() => ({
  props: {}
}));