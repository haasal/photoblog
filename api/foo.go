package handler

import (
	"context"
	"fmt"
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
	endpoint := getEnv("BUCKET_ENDPOINT")
	accessKeyID := getEnv("BUCKET_ACCESS_KEY")
	secretAccessKey := getEnv("BUCKET_SECRET_KEY")

	return minio.New(endpoint, &minio.Options{
		Creds: credentials.NewStaticV4(accessKeyID, secretAccessKey, ""),
	})
}

func getFileName(url string) (string, error) {

}

func getFile(client *minio.Client, fileName string) (*minio.Object, error) {
	return client.GetObject(context.Background(), fileName, getEnv("BUCKET_NAME"), minio.GetObjectOptions{})
}

func Handler(w http.ResponseWriter, r *http.Request) {
	r.URL.Path()

	minioClient, err := getMinioConnection()

	if err != nil {
		log.Fatalln(err)
	}

	obj, err := getFile(minioClient, "psylo.jpg")

	fmt.Fprintf(w, "%#v\n", minioClient)
}
