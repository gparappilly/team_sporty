import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import React from "react";
import { CloudinaryImageUpload } from "../../../lib/cloudinary";
import { useMeQuery, useUploadAvatarMutation } from "../../../generated/graphql";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        container: {},
        avatar: {
            width: theme.spacing(15),
            height: theme.spacing(15),
            margin: "auto",
            "&:hover": {
                opacity: "0.5",
            },
        },
        imageDrop: {
            display: "none",
        },
    }),
);

export default function AvatarUpload() {
    const { data, loading, refetch } = useMeQuery();
    const classes = useStyles();
    const [updateAvatar] = useUploadAvatarMutation();

    const readURL = async (e: any) => {
        e.preventDefault();
        const reader = new FileReader();
        const file = e.target.files[0];
        if (file) {
            reader.onloadend = () => {
                if (typeof reader.result === "string") {
                    uploadImage(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const dropURL = async (e: any) => {
        e.preventDefault();
        const reader = new FileReader();
        if (e.dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)
            const file = e.dataTransfer.items[0].getAsFile();
            if (file && file.type.match("image.*")) {
                reader.onloadend = () => {
                    if (typeof reader.result === "string") {
                        uploadImage(reader.result);
                    }
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const uploadImage = async (base64EncodedImage: any) => {
        CloudinaryImageUpload(base64EncodedImage)
            .then((data: any) => {
                const uploadedFileUrl = data.secure_url;
                updateAvatar({
                    variables: {
                        url: uploadedFileUrl,
                    },
                }).then((res) => {
                    refetch();
                });
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const dragover = (e: any) => {
        e.preventDefault();
    };

    return loading && data && data.me && data.me.avatarUrl ? null : (
        <div className={classes.container}>
            <form>
                <label htmlFor="fileupload" onDrop={(e) => dropURL(e)} onDragOver={(e) => dragover(e)}>
                    <Avatar id="avatar" alt="user" src={data?.me?.avatarUrl} className={classes.avatar} />
                </label>

                <input
                    id="fileupload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => readURL(e)}
                    className={classes.imageDrop}
                />
            </form>
        </div>
    );
}
