import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

const Loading = () => {
  return (
    <div className="container mx-auto m-10">
      <SkeletonTheme baseColor="#adb1b3" highlightColor="#444">
        <p>
          <Skeleton count={5} />
        </p>
      </SkeletonTheme>
    </div>
  );
};

export default Loading;
