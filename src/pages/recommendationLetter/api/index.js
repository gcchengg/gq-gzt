import {
  getCandidateInfoMock,
  getCompanySupervisorListMock,
  getCompanySupervisorPageMock,
  getInfoMock,
  saveCompanyMock,
  saveRecommendLetterMock,
} from "../mockApi";

export const getOrganizationTree = async () => ({ code: 200, data: [] });

export const getCompanySupervisorList = getCompanySupervisorListMock;

export const getCompanySupervisorPage = getCompanySupervisorPageMock;

export const getInfo = getInfoMock;

export const companyList = async () => ({ code: 200, data: [] });

export const saveCompany = saveCompanyMock;

export const hrSubmit = saveCompanyMock;

export const getCandidateInfo = getCandidateInfoMock;

export const uploadImg = async () => ({
  code: 200,
  data: {
    url: "",
    objectKey: "",
  },
});

export const saveRecommendLetter = saveRecommendLetterMock;
