import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Card, Avatar } from "@material-ui/core";
import { EventList } from "../../components/eventList/EventList";
import PostComponent from "../../components/post/PostComponent";
import PostCreator from "../../components/post/PostCreator";
import Link from "next/link";
import Button from "@material-ui/core/Button";
import PostBoard from "../../components/post/PostBoard";
import Layout from "../../components/layouts/index/Layout";
import { GetTeamIDsDocument, GetTeamPageDocument, Team, useGetTeamPageQuery } from "../../generated/graphql";
import { initializeApollo } from "../../lib/apollo";
import { GetStaticPaths, GetStaticProps } from "next";
import TeamDisplayPannel from "../../components/teamDisplayPannel/TeamDisplayPannel";

const useStyles = makeStyles({
    container: {
        paddingTop: 90,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-evenly",
    },

    rosterAvatar: {
        padding: 7,
    },
    leftColumn: {
        height: "80vh",
        position: "sticky",
        top: "10%",
        flexBasis: "25%",
        Width: "30vw",
        minHeight:"700px",
    },
    rightColumn: {
        // flexGrow:1

        marginLeft: "1em",
        flexBasis: "70%",
        maxWidth: "70vw",
    },
    columnItem: {
        marginBottom: 20,
    },

    rosterCard: {
        borderRadius: "15px",
    },
    rosterContainer: {
        display: "flex",
        marginLeft: "1em",
        padding: 10,
    },
    rosterText: {
        fontWeight: "bold",
        fontSize: "24px",
        marginLeft: "1em",
        marginTop: "4px",
        padding: 7,
    },
});

type Props = {
    id: string;
    errors?: string;
};

function TeamPage({ id, errors }: Props) {
    if (errors) {
        console.log(errors);
        return "Error component";
    }
    const classes = useStyles();
    const { data, loading, error } = useGetTeamPageQuery({
        variables: {
            teamID: id,
        },
        pollInterval: 500,
    });
    const reversePosts = data?.getTeam.team.posts?.slice().reverse();
    return (
        <Layout title={data?.getTeam.team.name}>
            <div className={classes.container}>
                <div className={classes.leftColumn}>
                    <TeamDisplayPannel data={data} />
                </div>
                <div className={classes.rightColumn}>
                    <div className={classes.columnItem}>
                        {reversePosts.map((post, index) => {
                            return !post.isPined ? null : (
                                <PostComponent
                                    key={index}
                                    content={post.content}
                                    firstName={post.user.name}
                                    avatarUrl={post.user.avatarUrl}
                                    lastModifyDate={post.lastModifyDate}
                                    isPinned={post.isPined}
                                    postID={post._id}
                                    teamID={id}
                                    isCoach={data?.getTeam.isCoach}
                                    imgUrls={post.imgUrls}
                                />
                            );
                        })}
                    </div>
                    <div className={classes.columnItem}>
                        <PostCreator teamID={id} />
                    </div>
                    {/*<div className={classes.columnItem}>*/}
                    {/*    <Card className={classes.rosterCard}>*/}
                    {/*        <div className={classes.rosterText}>*/}
                    {/*            <Typography variant={"h5"}>Roster</Typography>*/}
                    {/*        </div>*/}
                    {/*        <div className={classes.rosterContainer}>*/}
                    {/*            {posts.map((name, index) => {*/}
                    {/*                return (*/}
                    {/*                    <div key={index} className={classes.rosterAvatar}>*/}
                    {/*                        /!*<Link href={"/"}>*!/*/}
                    {/*                        <Avatar key={index}>{name}</Avatar>*/}
                    {/*                        /!*</Link>*!/*/}
                    {/*                    </div>*/}
                    {/*                );*/}
                    {/*            })}*/}
                    {/*        </div>*/}
                    {/*    </Card>*/}
                    {/*</div>*/}
                    {reversePosts?.map((post, index) => {
                        return post.isPined ? null : (
                            <PostComponent
                                key={index}
                                content={post.content}
                                firstName={post.user.name}
                                lastModifyDate={post.lastModifyDate}
                                isPinned={post.isPined}
                                postID={post._id}
                                teamID={id}
                                isCoach={data?.getTeam.isCoach}
                                avatarUrl={post.user.avatarUrl}
                                imgUrls={post.imgUrls}
                            />
                        );
                    })}
                </div>
            </div>
        </Layout>
    );
}

export default TeamPage;

export const getStaticPaths: GetStaticPaths = async () => {
    const apolloClient = initializeApollo();
    const teams = await apolloClient.query({
        query: GetTeamIDsDocument,
    });
    const paths = teams.data.getTeams.map(({ team }: { team: Team }) => {
        return { params: { id: team._id } };
    });
    return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async (url) => {
    try {
        const id = url.params?.id;
        const apolloClient = initializeApollo();
        await apolloClient.query({
            query: GetTeamPageDocument,
            variables: { teamID: id },
        });
        return { props: { id, initialApolloState: apolloClient.cache.extract() } };
    } catch (err) {
        return { props: { errors: err.message } };
    }
};
