package handler

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

func getEnv(name string) string {
	env, ok := os.LookupEnv(name)
	if !ok {
		log.Fatalf("Environment variable %s not set!", name)
	}
	return env
}

func getMinioConnection() (*minio.Client, error) {
	// TODO: Add ssl
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

func sendFile(w http.ResponseWriter, file *minio.Object) error {
	_, err := io.Copy(w, file)
	if err != nil {
		return fmt.Errorf("failed to read file: %s", err)
	}
	return nil
}

func Handler(w http.ResponseWriter, r *http.Request) {
	minioClient, err := getMinioConnection()

	if err != nil {
		log.Fatalln(err)
	}

	fileName := r.URL.Path[len("/api/files/"):]
	bucketName := getEnv("BUCKET_NAME")

	file, err := getFile(minioClient, fileName, bucketName)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(fmt.Sprintf("File %s not found in %s", fileName, bucketName)))
		return
	}
	defer file.Close()

	if err := sendFile(w, file); err != nil {
		log.Fatalln("Failed to send file:", err)
	}
}
