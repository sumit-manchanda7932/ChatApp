import React, { useCallback, useEffect, useRef, useState } from "react";
import * as Yup from "yup";
// form
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Avatar, Button, Stack, TextField } from "@mui/material";
import FormProvider from "../../components/hook-form/FormProvider";
import { RHFTextField } from "../../components/hook-form";
import { UpdateProfile } from "../../redux/Slices/app";
import { useDispatch, useSelector } from "react-redux";

const ProfileForm = () => {
  const ref=useRef();
  const dispatch=useDispatch();
  const profile=useSelector((state)=>state.auth)
  const [image,setImage]=useState(null);
  const [Url,setUrl]=useState(null);
  useEffect(()=>{
    if(profile?.avatar.length!=0)setUrl(profile?.avatar);
  },[]);
  const ProfileSchema = Yup.object().shape({
    firstName: Yup.string().required("Name is required"),
    about: Yup.string().required("About is required"),
    // avatar: Yup.string().required("Avatar is required").nullable(true),
  });

  const defaultValues = {
    firstName: `${profile?.firstName.length!=0?profile?.firstName:""}`,
    about: `${profile?.about.length!=0?profile?.about:""}`,
    
  };

  const methods = useForm({
    resolver: yupResolver(ProfileSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting, isSubmitSuccessful },
  } = methods;

  const values = watch();

  const onSubmit = async (data) => {
    try {
      //   Send API request
      console.log("DATA", data);
      if(image) uploadImage(image);
      
      dispatch(UpdateProfile({...data,avatar:Url}));
     
    } catch (error) {
      console.error(error); 
    }
  };

  // const handleDrop = useCallback(
  //   (acceptedFiles) => {
  //     const file = acceptedFiles[0];


  //     const newFile = Object.assign(file, {
  //       preview: URL.createObjectURL(file),
  //     });

  //     if (file) {
  //       setValue("avatar", newFile, { shouldValidate: true });
  //     }
  //   },
  //   [setValue]
  // );
    const uploadImage = () => {
    const data = new FormData()
    data.append("file", image)
    data.append("upload_preset", "uploadimages")
    data.append("cloud_name","dot4gtkeg")
    fetch("  https://api.cloudinary.com/v1_1/dot4gtkeg/image/upload",{
    method:"post",
    body: data
    })
    .then(resp => resp.json())
    .then(data => {
      console.log(data);
    setUrl(data.url)
    })
    .catch(err => console.log(err))
    }

    const handleChange=(event)=>{
      if (event.target.files && event.target.files[0]) {
        setImage(event.target.files[0]);
        setUrl(URL.createObjectURL(event.target.files[0]));
      }
    }
  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack alignItems={"center"} spacing={4}>
        <Avatar src={Url?Url:profile?.avatar} sx={{ width: 120, height: 120}}/>
        <Button  color="primary"
            size="large"
            variant="contained" onClick={()=>{ref.current?.click()}}>
              Set Profile
        <input ref={ref} type="file" onChange={handleChange} hidden/>
            </Button> 
        <RHFTextField
          helperText={"This name is visible to your contacts"}
          name="firstName"
          label="First Name"
        />
        <RHFTextField multiline rows={4} name="about" label="About" />

        <Stack direction={"row"} justifyContent="end">
          <Button
            color="primary"
            size="large"
            type="submit"
            variant="contained"
            // loading={isSubmitSuccessful || isSubmitting}
          >
            Save
          </Button>
        </Stack>
      </Stack>
    </FormProvider>
  );
};

export default ProfileForm;