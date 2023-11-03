import { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { BsFillImageFill } from "react-icons/bs";
import { AiFillCheckSquare } from "react-icons/ai";
import Swal from "sweetalert2";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

const img_hosting_Token = import.meta.env.VITE_IMAGE_UPLOAD;
const LOCAL_STORAGE_KEY = "imageOrder";
const Home = () => {
  const { reset } = useForm();
  const imgHostingUrl = `https://api.imgbb.com/1/upload?key=${img_hosting_Token}`;
  const [loading, setLoading] = useState(true);
  const [loadImage, setLoadImage] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState([]);
  const [draggedImage, setDraggedImage] = useState(null);
  const [control, setControl] = useState(false);
  useEffect(() => {
    // Fetch images from the server when the component mounts
    axios
      .get("https://ollyo-task-server.vercel.app/all_images")
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

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      console.log("You haven't selected an image.");
      return;
    }

    // Handle image submission
    const formData = new FormData();
    formData.append("image", selectedFile);
    setLoadImage(true);

    fetch(imgHostingUrl, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((imgResponse) => {
        if (imgResponse.success) {
          const imgURL = imgResponse.data.url;
          const updateImageFile = {
            imgURL,
          };
          axios
            .post(
              "https://ollyo-task-server.vercel.app/upload_image",
              updateImageFile
            )
            .then((res) => {
              if (res.data.insertedId) {
                Swal.fire({
                  position: "top-center",
                  icon: "success",
                  title: "Upload successfully",
                  showConfirmButton: false,
                  timer: 1500,
                });
                reset();
                setControl(!control);
                setLoadImage(false);
              }
            })
            .catch((err) => {
              console.log(err);
              setLoadImage(false);
            });
        }
      })
      .catch(() => {
        console.log("Error uploading image.");
        setLoadImage(false);
      });
  };

  const handleSelectedImage = (e, id) => {
    // Handle checkbox selection
    const filter = images.find((data) => data?._id === id);
    const uploadedObj = {
      ...filter,
      isChecked: e.target.checked,
    };

    axios
      .patch(
        `https://ollyo-task-server.vercel.app/update_uploaded_images/${id}`,
        uploadedObj
      )
      .then((res) => {
        if (res.data?.matchedCount) {
          setSelectedImage((prevSelected) => {
            const updatedSelected = [...prevSelected];
            const index = updatedSelected.findIndex((item) => item._id === id);
            setControl(!control);
            if (index !== -1) {
              updatedSelected[index] = {
                ...updatedSelected[index],
                isChecked: e.target.checked,
              };
            }

            return updatedSelected;
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleDeleteFiles = () => {
    // Handle file deletion
    axios
      .delete(
        "https://ollyo-task-server.vercel.app/delete_images",
        selectedImage
      )
      .then((res) => {
        if (res.data?.result?.deletedCount) {
          Swal.fire({
            position: "top-center",
            icon: "success",
            title: `${res.data?.massage}`,
            showConfirmButton: false,
            timer: 1500,
          });
          setControl(!control);
          setSelectedImage([]);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    // Load saved image order from localStorage
    const savedOrder = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (savedOrder) {
      setImages(JSON.parse(savedOrder));
    }
  }, []);

  // Function to update the image order and save it in localStorage
  const updateImageOrder = (newOrder) => {
    setImages(newOrder);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newOrder));
  };

  const onDragStart = (image) => {
    // Handle the drag start event
    setDraggedImage(image);
  };

  const onDragOver = (e, image) => {
    // Handle the drag over event
    e.preventDefault();

    if (draggedImage === image) {
      return;
    }

    const currentIndex = images.indexOf(draggedImage);
    const targetIndex = images.indexOf(image);

    const newImages = [...images];
    newImages.splice(currentIndex, 1);
    newImages.splice(targetIndex, 0, draggedImage);

    // Update the image order and save it in localStorage
    updateImageOrder(newImages);
  };

  const onDrop = () => {
    // Handle the onDrop event
    // Set draggedImage to null
    setDraggedImage(null);
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
        <div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
            {images.map((image) => {
              return (
                <div
                  key={image._id}
                  draggable={true}
                  onDragStart={() => onDragStart(image)}
                  onDragOver={(e) => onDragOver(e, image)}
                  onDrop={onDrop}
                  className={` itemsCustomStyle border w-full relative rounded-[20px] overflow-hidden 
                  flex justify-center items-center group cursor-grab
                  ${
                    images[0]?._id === image?._id &&
                    "md:col-span-2 md:row-span-2"
                  }
                  ${draggedImage ? "moving" : ""}
                `}
                >
                  <img
                    style={{
                      height: `${
                        images[0]?._id == image?._id ? "100%" : "200px"
                      }`,
                      objectFit: "contain",
                      width: "auto",
                      borderRadius: "20px",
                    }}
                    className="w-full h-full p-5"
                    src={image?.imgURL}
                    alt=""
                  />
                  <div
                    className={`${
                      image?.isChecked == true
                        ? "bg-opacity-20 transition-all duration-500"
                        : "hidden bg-opacity-40"
                    } group-hover:block items-center justify-center absolute inset-0 bg-black  transition-all  ease-out p-5`}
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
            <div className="relative h-full border-2 border-gray-400 bg-gray-200 border-dashed rounded-[20px]  text-gray-500 ">
              <label
                htmlFor="file-upload"
                className="py-[80px] cursor-pointer  flex justify-center items-center flex-col"
              >
                <BsFillImageFill></BsFillImageFill>
                <span>{loadImage ? "Uploading..." : "Add Photo"}</span>
              </label>

              <input
                id="file-upload"
                type="file"
                className="custom-file-input"
                name="image"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
