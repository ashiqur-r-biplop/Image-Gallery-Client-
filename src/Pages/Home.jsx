import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BsFillImageFill } from "react-icons/bs";
import Swal from "sweetalert2";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { AiFillCheckSquare } from "react-icons/ai";

const img_hosting_Token = import.meta.env.VITE_IMAGE_UPLOAD;

const Home = () => {
  const { register, handleSubmit, reset } = useForm();
  const imgHostingUrl = `https://api.imgbb.com/1/upload?key=${img_hosting_Token}`;
  const [loading, setLoading] = useState(true);
  const [control, setControl] = useState(true);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState([]);
  useEffect(() => {
    axios
      .get("http://localhost:5000/all_images")
      .then((res) => {
        const checkedImages = res.data.filter(
          (data) => data?.isChecked === true
        );
        setSelectedImage(checkedImages);
        setImages(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [control]);

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("image", data?.file[0]);
    fetch(imgHostingUrl, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((imgResponse) => {
        if (imgResponse.success) {
          const imgURL = imgResponse?.data?.url;
          const updateImageFile = {
            imgURL,
          };
          axios
            .post("http://localhost:5000/upload_image", updateImageFile)
            .then((res) => {
              if (res.data?.insertedId) {
                Swal.fire({
                  position: "top-center",
                  icon: "success",
                  title: "Upload successfully",
                  showConfirmButton: false,
                  timer: 1500,
                });
                setControl(!control);
                reset();
              }
            })
            .catch((err) => {
              console.log(err);
            });
        }
      })
      .catch(() => {
        console.log("you ar note sellect image");
      });
  };
  const handleSelectedImage = (e, id) => {
    console.log();
    const filter = images.find((data) => data?._id == id);
    const uploadedObj = {
      ...filter,
      isChecked: e.target.checked,
    };
    axios
      .patch(`http://localhost:5000/update_uploaded_images/${id}`, uploadedObj)
      .then((res) => {
        if (res.data?.matchedCount) {
          setControl(!control);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const handleDeleteFiles = () => {
    axios
      .delete("http://localhost:5000/delete_images", selectedImage)
      .then((res) => {
        if (res.data?.result?.deletedCount) {
          Swal.fire({
            position: "top-center",
            icon: "success",
            title: `${res.data?.massage}`,
            showConfirmButton: false,
            timer: 1500,
          });
        }
        setControl(!control);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  if (loading) {
    return (
      <>
        <div className="max-w-[1200px] mx-auto my-4">
          <h1 className="text-2xl font-bold">Gallery</h1>
        </div>
        <hr className="border" />
        <div className="container mx-auto m-10">
          <SkeletonTheme baseColor="#adb1b3" highlightColor="#444">
            <p>
              <Skeleton count={5} />
            </p>
          </SkeletonTheme>
        </div>
      </>
    );
  }
  return (
    <>
      {selectedImage.length <= 0 ? (
        <div className="max-w-[1200px] lg:mx-auto mx-5 my-4">
          <h1 className="text-2xl font-bold ps-5 md:ps-0">Gallery</h1>
        </div>
      ) : (
        <div className="max-w-[1200px] lg:mx-auto mx-5 my-4">
          <div className="flex justify-between items-center">
            <h1 className="md:text-2xl ps-5 md:ps-0 font-bold flex gap-1 md:gap-3 items-center">
              <span className="text-[#4674ff]">
                <AiFillCheckSquare></AiFillCheckSquare>
              </span>
              <span>{selectedImage.length} Files Selected</span>
            </h1>
            <button
              onClick={handleDeleteFiles}
              className="text-red-500 md:text-xl font-semibold"
            >
              Delete Files
            </button>
          </div>
        </div>
      )}
      <hr className="border" />
      <div className="max-w-[1200px] lg:mx-auto mx-5 my-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          {images.map((image, i) => {
            return (
              <div
                key={i}
                className={`border w-full cursor-pointer relative rounded-[20px] overflow-hidden flex justify-center items-center group ${
                  images[0]?._id == image?._id && "md:col-span-2 md:row-span-2"
                }`}
              >
                <img
                  style={{
                    objectFit: "contain",
                    width: "auto",
                    borderRadius: "20px",
                  }}
                  className="w-full h-full p-5"
                  src={image?.imgURL}
                  alt=""
                />
                <div
                  className={`
                  ${
                    image?.isChecked == true ? "" : "hidden"
                  } group-hover:block items-center justify-center absolute inset-0 bg-black bg-opacity-20 transition-all  ease-out p-5`}
                >
                  <input
                    onChange={(e) => handleSelectedImage(e, image?._id)}
                    type="checkbox"
                    defaultChecked={image?.isChecked}
                    className="mr-2 cursor-pointer"
                  />
                </div>
              </div>
            );
          })}
          <form action="" onSubmit={handleSubmit(onSubmit)}>
            <label
              htmlFor="file"
              className="border-2 border-gray-400 bg-gray-200 text-gray-500 rounded-[20px] py-[80px] cursor-pointer border-dashed flex justify-center items-center flex-col "
            >
              <BsFillImageFill></BsFillImageFill>
              <span>Add Photo</span>
            </label>
            <input
              type="file"
              {...register("file", { required: true })}
              className="custom-file-input"
              id="file"
            />
            <div className="text-end">
              <input
                type="submit"
                value="Upload"
                className="px-2 py-1 cursor-pointer"
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Home;
