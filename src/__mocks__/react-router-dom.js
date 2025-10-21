// Mock implementation of react-router-dom
export const useNavigate = jest.fn();
export const useParams = jest.fn();
export const useLocation = jest.fn();

export default {
  useNavigate,
  useParams,
  useLocation,
};
