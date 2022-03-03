import React, { useCallback, useState } from "react";
import style from "./recruit.module.scss";
import { api_types, app_types, notion_types } from "@types";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { message, Button } from "antd";

// COMPONENTS
import PaddingContainer from "components/Common/PaddingContainer";
import BlockViewer from "components/Common/BlockViewer";
import StudyStatusTag from "components/Common/StudyStatusTag";
import DetailPageHeader from "components/Common/DetailPageHeader";
import DetailPageSkeleton from "components/Common/DetailPageSkeleton";
import MetaHead from "components/Common/MetaHead";

// IMPORT LIBS
import { POST_applyStudy } from "lib/client/api";
import { getWholeBlock } from "lib/server/notion";
import { getLocaleEndDate } from "lib/client/study";
import { API_GetStudyPage } from "lib/server/study-page";
import { getStudyOpenGraphImageURL } from "lib/server/opengraph";

// LAZY
const ApplyStudyDrawer = dynamic(
  () => import("components/Study/ApplyStudyDrawer"),
  { ssr: false }
);

const Comments = dynamic(() => import("components/Common/Comment"), {
  ssr: false,
});

// COMPONENT

interface Props {
  page: app_types.ProcessedPageWithStudy;
  blocks: notion_types.Block[];
  ogImageUrl: string;
}

const Study = (props: Props) => {
  const { page, blocks } = props;
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const toggleModal = useCallback(() => setIsOpen((v) => !v), []);

  const submit = async (
    applyData: Partial<api_types.StudyApplyRequestBody>
  ) => {
    const requestBody: api_types.StudyApplyRequestBody = {
      target_study_id: page.id,
      ...(applyData as api_types.StudyApplyRequestBody),
    };

    await POST_applyStudy({
      requestBody: requestBody,
      onSuccess: () => {
        message.success({
          content: "스터디 신청 완료 ⭐",
          style: {
            marginTop: "20vh",
          },
        });
        toggleModal();
      },
      onFail: () => {
        message.error({
          content: "스터디 신청에 실패하였습니다 😥",
          style: {
            marginTop: "20vh",
          },
        });
        toggleModal();
      },
    });
  };

  if (router.isFallback) {
    return <DetailPageSkeleton />;
  }

  if (!page) {
    return <div>PAGE NOT RETURENDED</div>;
  }
  return (
    <div className={style.container}>
      <MetaHead
        title={page.study_name}
        description={page.study_introduce}
        thumbnail={props.ogImageUrl || page.udemy_lecture_thumbnail_url}
      />
      {/* <ApplyStudyModal
        isOpen={isOpen}
        onClose={toggleModal}
        onSubmit={submit}
      /> */}
      <ApplyStudyDrawer
        isOpen={isOpen}
        onClose={toggleModal}
        onSubmit={submit}
      />
      <PaddingContainer>
        <DetailPageHeader
          headChildren={
            <div className={style.tag_wrapper}>
              <StudyStatusTag studyStatus={page.study_status}></StudyStatusTag>
              {page.study_status === "OPEN" && (
                <StudyStatusTag studyStatus={page.study_status}>
                  {getLocaleEndDate(page.study_apply_end_date)}
                </StudyStatusTag>
              )}
            </div>
          }
          title={page.study_name}
          footerChildren={
            <div className={style.introduce_wrapper}>
              {page.study_introduce}
            </div>
          }
        />
        <section className={style.info_section}>
          <div className={style.info_item}>
            <span className={style.info_label}>🗓️ 스터디 모집 일정</span>
            <span className={style.info_value}>
              {page.study_start_date} ~ {page.study_apply_end_date}
            </span>
          </div>
          <div className={style.info_item}>
            <span className={style.info_label}>🚨 스터디 대상 강의</span>
            <span className={style.info_value}>{page.udemy_lecture_name}</span>
          </div>
          <div className={style.info_item}>
            <span className={style.info_label}>🧑‍🏫 스터디 정원</span>
            <span className={style.info_value}>
              {page.study_max_member_count}명
            </span>
          </div>
          <div className={style.info_item}>
            <span className={style.info_label}>🙋‍♂️ 현재 신청자</span>
            <span className={style.info_value}>{page.apply_count} 명</span>
          </div>
        </section>
        <section className={style.lecture_info_section}>
          <h3>🌏 스터디와 함께 진행되는 강의</h3>
          <div className={style.lecture_info_main}>
            <a target={"_blank"} rel="noreferrer" href={page.udemy_lecture_url}>
              <img src={page.udemy_lecture_thumbnail_url} />
            </a>
            <div>
              <div>{page.udemy_lecture_name}</div>
              <div>{page.udemy_lecture_url}</div>
            </div>
          </div>
        </section>
        <section className={style.article_section}>
          <BlockViewer blocks={blocks} />
        </section>

        {page.study_status === "OPEN" && (
          <section className={style.apply_btn_wrapper}>
            <Button
              onClick={toggleModal}
              type={"primary"}
              size={"large"}
              shape={"round"}
            >
              스터디 참가 신청하기
            </Button>
          </section>
        )}
        <Comments />
      </PaddingContainer>
    </div>
  );
};

export default Study;

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  };
};

export const getStaticProps = async (ctx) => {
  const { page_id } = ctx.params;

  const [page, blocks] = await Promise.all([
    API_GetStudyPage(page_id),
    getWholeBlock(page_id),
  ]);

  if (page.study_status in ["INPROGRESS", "CLOSE"]) {
    return {
      redirect: { destination: `/study/${page_id}/overview` },
    };
  }

  const ogPath = `url=pming/study&mentor_name=${page.mentor_name}&title=${page.study_name}&mentor_profile_image=${page.mentor_profile_image_url}&type=study`;
  const ogImageUrl = getStudyOpenGraphImageURL(ogPath);

  return {
    props: {
      page: page,
      blocks: blocks,
      ogImageUrl,
    },
    revalidate: 1,
  };
};

/*
 * LEGACY
 * 모든 page 사전 pre rendering 버전
 */
// export const getStaticPaths = async () => {
//   const pages = await API_getRawStudyPageList();
//   return {
//     paths: pages.map((page) => ({ params: { page_id: page.id } })),
//     fallback: true,
//   };
// };
