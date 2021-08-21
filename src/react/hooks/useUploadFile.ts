import { useContext, useState } from 'react';
import { NhostClientContext } from '../context';

type UploadState = {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
};

export function useNhostStorageUploader() {
  const [uploadState, setUploadState] = useState<UploadState>({
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
  });
  const nhost = useContext(NhostClientContext);

  const uploadFile = ({
    file,
    bucketId,
    name,
  }: {
    file: File;
    bucketId?: string;
    name?: string;
  }) => {
    console.log('upload file');

    setUploadState({
      isLoading: true,
      isSuccess: false,
      isError: false,
      error: null,
    });

    // 123

    console.log('uplad file with headers:');
    console.log(nhost!.auth.getAccessToken());
    // TODO: Does not work

    // nhost?.storage.upload({ file });

    setUploadState({
      isLoading: true,
      isSuccess: false,
      isError: false,
      error: null,
    });
  };

  return {
    isLoading: uploadState.isLoading,
    isSuccess: uploadState.isSuccess,
    isError: uploadState.isError,
    error: uploadState.error,
    uploadFile,
  };
}
