package cmd

import (
	"log"

	"github.com/joho/godotenv"
	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "cli",
	Short: "A CLI to manage this projects content/assets",
}

func init() {
	if err := godotenv.Load("../.env"); err != nil {
		log.Fatalln(".env file not found")
	}
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		log.Fatalln(err)
	}
}
