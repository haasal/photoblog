package handler

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

const ApiErrorFileMissing = "file not found"
const ApiErrorFailedMinioConnection = "failed to establish connection to image backend"
const ApiErrorFailedSendingFile = "file couldn't be sent to client"
const ApiErrorNoFilePath = "no file path specified in query"

var minioClient *minio.Client = nil
var bucketName string

func getEnv(name string) string {
	env, ok := os.LookupEnv(name)
	if !ok {
		log.Fatalf("Environment variable %s not set!", name)
	}
	return env
}

func getMinioConnection() (*minio.Client, error) {
	// TODO: Add ssl
	if minioClient != nil {
		log.Println("Using cached minio client")
		return minioClient, nil
	}

	hostname := getEnv("BUCKET_ENDPOINT")
	port := getEnv("BUCKET_PORT")
	endpoint := fmt.Sprintf("%s:%s", hostname, port)
	accessKeyID := getEnv("BUCKET_ACCESS_KEY")
	secretAccessKey := getEnv("BUCKET_SECRET_KEY")

	return minio.New(endpoint, &minio.Options{
		Creds: credentials.NewStaticV4(accessKeyID, secretAccessKey, ""),
	})
}

func getFile(client *minio.Client, fileName string, bucketName string) (*minio.Object, error) {
	return client.GetObject(context.Background(), bucketName, fileName, minio.GetObjectOptions{})
}

func Handler(w http.ResponseWriter, r *http.Request) {
	godotenv.Load("../.env")

	minioClient, err := getMinioConnection()

	if err != nil {
		http.Error(w, ApiErrorFailedMinioConnection, http.StatusInternalServerError)
		return
	}

	fileName := r.URL.Query().Get("file")
	if fileName == "" {
		http.Error(w, ApiErrorNoFilePath, http.StatusBadRequest)
		return
	}

	if bucketName == "" {
		bucketName = getEnv("BUCKET_NAME")
	}

	file, err := getFile(minioClient, fileName, bucketName)
	if err != nil {
		http.Error(w, ApiErrorFileMissing, http.StatusNotFound)
		return
	}
	defer file.Close()

	if _, err := io.Copy(w, file); err != nil {
		http.Error(w, ApiErrorFailedSendingFile, http.StatusNotFound)
	}
}
